"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrackingResult from "@/components/tracking-result";
import { Search } from "lucide-react";
import { usePackageTracking } from "@/components/dashboard/hooks/usePackageTracking";

const formSchema = z.object({
  trackingNumber: z
    .string()
    .min(1, "Введите трек-номер")
    .regex(/^TE-\d{4}$/, "Неверный формат. Пример: TE-6507"),
});

export default function TrackingForm() {
  const { isLoading, trackingResult, trackPackage } = usePackageTracking();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { trackingNumber: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    trackPackage(values.trackingNumber);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Введите трек номер (Например: TE-6507)"
            {...form.register("trackingNumber")}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Search className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Отследить</span>
          </Button>
        </div>
        {form.formState.errors.trackingNumber && (
          <p className="text-sm text-destructive">
            {form.formState.errors.trackingNumber.message}
          </p>
        )}
      </form>

      {trackingResult && <TrackingResult data={trackingResult} />}
    </div>
  );
}