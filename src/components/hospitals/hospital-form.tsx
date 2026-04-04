"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHospitalSchema, type CreateHospitalInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface HospitalFormProps {
  defaultValues?: Partial<CreateHospitalInput>;
  onSubmit: (data: CreateHospitalInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function HospitalForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Hospital",
}: HospitalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHospitalInput>({
    resolver: zodResolver(createHospitalSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="City General Hospital" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="123 Main St" {...register("address")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="New York" {...register("city")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="555-123-4567" {...register("phone")} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
