"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDoctorSchema, type CreateDoctorInput } from "@/lib/validations";
import { useSpecializations, useCreateSpecialization } from "@/hooks/use-specializations";
import { useHospitals, useCreateHospital } from "@/hooks/use-hospitals";
import { usePaginatedItems } from "@/hooks/use-paginated-items";
import { ComboboxCreatable } from "@/components/combobox-creatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const spec = usePaginatedItems();
  const specQuery = useSpecializations({
    search: spec.search || undefined,
    page: spec.page,
    limit: 30,
  });
  useEffect(() => {
    spec.setQueryResult(specQuery.data ?? undefined, specQuery.isLoading);
  }, [specQuery.data, specQuery.isLoading, spec.setQueryResult]);
  const createSpec = useCreateSpecialization();

  const hosp = usePaginatedItems();
  const hospQuery = useHospitals({
    search: hosp.search || undefined,
    page: hosp.page,
    limit: 30,
  });
  useEffect(() => {
    hosp.setQueryResult(hospQuery.data ?? undefined, hospQuery.isLoading);
  }, [hospQuery.data, hospQuery.isLoading, hosp.setQueryResult]);
  const createHosp = useCreateHospital();

  const [specLabel, setSpecLabel] = useState("");
  const [hospLabel, setHospLabel] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues,
  });

  const specValue = watch("specialization") || "";
  const hospValue = watch("hospital") || "";

  const specSelectedLabel =
    specLabel || spec.items.find((s) => s._id === specValue)?.name || "";
  const hospSelectedLabel =
    hospLabel || hosp.items.find((h) => h._id === hospValue)?.name || "";

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
        <Label>Specialization</Label>
        <ComboboxCreatable
          value={specValue}
          onChange={(val) => {
            setValue("specialization", val);
            const item = spec.items.find((s) => s._id === val);
            if (item) setSpecLabel(item.name);
          }}
          items={spec.items}
          isLoading={spec.isLoading}
          hasMore={spec.hasMore}
          onSearch={spec.onSearch}
          onLoadMore={spec.onLoadMore}
          onCreate={async (name) => {
            const created = await createSpec.mutateAsync({ name });
            setSpecLabel(created.name);
            return created;
          }}
          placeholder="Select specialization"
          searchPlaceholder="Search specializations..."
          selectedLabel={specSelectedLabel}
        />
        {errors.specialization && (
          <p className="text-sm text-destructive">
            {errors.specialization.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Hospital</Label>
        <ComboboxCreatable
          value={hospValue}
          onChange={(val) => {
            setValue("hospital", val);
            const item = hosp.items.find((h) => h._id === val);
            if (item) setHospLabel(item.name);
          }}
          items={hosp.items}
          isLoading={hosp.isLoading}
          hasMore={hosp.hasMore}
          onSearch={hosp.onSearch}
          onLoadMore={hosp.onLoadMore}
          onCreate={async (name) => {
            const created = await createHosp.mutateAsync({ name });
            setHospLabel(created.name);
            return created;
          }}
          placeholder="Select hospital"
          searchPlaceholder="Search hospitals..."
          selectedLabel={hospSelectedLabel}
        />
        {errors.hospital && (
          <p className="text-sm text-destructive">{errors.hospital.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="555-123-4567" {...register("phone")} />
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
