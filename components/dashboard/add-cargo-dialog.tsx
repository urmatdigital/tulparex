"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tracking_number: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { error } = await supabase.from("cargos").insert({
        user_id: user.id,
        tracking_number: values.tracking_number,
        description: values.description,
        status: "Создан",
      });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Груз добавлен в систему",
      });

      form.reset();
      onCargoAdded();
    } catch (error) {
      console.error("Error adding cargo:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить груз",
      });
    } finally {
      setIsLoading(false);
    }
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
                    <Input placeholder="TE-XXXX" {...field} />
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
                    <Textarea
                      placeholder="Опишите ваш груз..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить груз"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}