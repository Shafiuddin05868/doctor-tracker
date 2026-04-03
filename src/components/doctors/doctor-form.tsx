"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDoctorSchema, type CreateDoctorInput } from "@/lib/validations";
import { useSpecializations } from "@/hooks/use-specializations";
import { useHospitals } from "@/hooks/use-hospitals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface DoctorFormProps {
  defaultValues?: Partial<CreateDoctorInput>;
  onSubmit: (data: CreateDoctorInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function DoctorForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Create Doctor",
}: DoctorFormProps) {
  const { data: specializations } = useSpecializations();
  const { data: hospitals } = useHospitals();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Dr. John Smith" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Select
          defaultValue={defaultValues?.specialization}
          onValueChange={(val) => setValue("specialization", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations?.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialization && (
          <p className="text-sm text-destructive">
            {errors.specialization.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospital">Hospital</Label>
        <Select
          defaultValue={defaultValues?.hospital}
          onValueChange={(val) => setValue("hospital", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent>
            {hospitals?.map((h) => (
              <SelectItem key={h._id} value={h._id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.hospital && (
          <p className="text-sm text-destructive">{errors.hospital.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="555-123-4567"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@hospital.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
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
