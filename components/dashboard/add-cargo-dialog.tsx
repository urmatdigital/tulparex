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
  description: z.string().min(1, "Введите описание груза"),
});

interface AddCargoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCargoAdded: () => void;
}

export default function AddCargoDialog({
  open,
  onOpenChange,
  onCargoAdded,
}: AddCargoDialogProps) {
  const { isLoading, addItem } = useAddItem({
    table: "cargos",
    successMessage: "Груз добавлен в систему",
    errorMessage: "Не удалось добавить груз",
    transformData: (data, userId) => ({
      ...data,
      user_id: userId,
      status: "Создан",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tracking_number: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addItem(values, () => {
      form.reset();
      onCargoAdded();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новый груз</DialogTitle>
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
                    <Input disabled={isLoading} {...field} />
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
                  <FormLabel>Описание груза</FormLabel>
                  <FormControl>
                    <Textarea disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить груз"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}