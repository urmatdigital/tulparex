"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddItem } from "./hooks/useAddItem";

const formSchema = z.object({
  tracking_number: z.string().min(1, "Введите трек-номер"),
  description: z.string().min(1, "Введите описание посылки"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPackageAdded: () => void;
}

export default function AddPackageDialog({
  open,
  onOpenChange,
  onPackageAdded,
}: AddPackageDialogProps) {
  const { isLoading, addItem } = useAddItem<FormValues>({
    table: "packages",
    successMessage: "Посылка добавлена в систему",
    errorMessage: "Не удалось добавить посылку",
    transformData: (data) => ({
      ...data,
      status: "На складе в Китае",
    }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tracking_number: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await addItem(values, () => {
      form.reset();
      onPackageAdded();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новую посылку</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tracking_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Трек-номер</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading} 
                      placeholder="Например: TE-6507"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание посылки</FormLabel>
                  <FormControl>
                    <Textarea 
                      disabled={isLoading} 
                      placeholder="Опишите содержимое посылки"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Добавление..." : "Добавить посылку"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
