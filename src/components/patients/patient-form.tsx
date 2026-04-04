"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPatientSchema, type CreatePatientInput } from "@/lib/validations";
import { useDoctors } from "@/hooks/use-doctors";
import { useConditions } from "@/hooks/use-conditions";
import { usePaginatedItems } from "@/hooks/use-paginated-items";
import { ComboboxSearch } from "@/components/combobox-search";
import { ComboboxCreatable } from "@/components/combobox-creatable";
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

interface PatientFormProps {
  defaultValues?: Partial<CreatePatientInput>;
  onSubmit: (data: CreatePatientInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  hideDoctor?: boolean;
}

export function PatientForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Patient",
  hideDoctor = false,
}: PatientFormProps) {
  // Condition combobox
  const condPaginated = usePaginatedItems();
  const condQuery = useConditions({
    search: condPaginated.search || undefined,
    page: condPaginated.page,
    limit: 30,
  });
  useEffect(() => {
    condPaginated.setQueryResult(condQuery.data ?? undefined, condQuery.isLoading);
  }, [condQuery.data, condQuery.isLoading, condPaginated.setQueryResult]);

  // Doctor combobox
  const doc = usePaginatedItems();
  const docQuery = useDoctors({
    search: doc.search || undefined,
    page: doc.page,
    limit: 30,
  });
  useEffect(() => {
    if (docQuery.data) {
      doc.setQueryResult(
        {
          items: docQuery.data.doctors.map((d) => ({ _id: d._id, name: d.name })),
          page: docQuery.data.page,
          totalPages: docQuery.data.totalPages,
        },
        docQuery.isLoading
      );
    } else {
      doc.setQueryResult(undefined, docQuery.isLoading);
    }
  }, [docQuery.data, docQuery.isLoading, doc.setQueryResult]);

  const [docLabel, setDocLabel] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      ...defaultValues,
      doctor: defaultValues?.doctor ?? "",
    },
  });

  const condValue = watch("condition") || "";
  const docValue = watch("doctor") || "";
  const docSelectedLabel =
    docLabel || doc.items.find((d) => d._id === docValue)?.name || "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Doe" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="30"
            {...register("age", { valueAsNumber: true })}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            defaultValue={defaultValues?.gender}
            onValueChange={(val) =>
              setValue("gender", val as "male" | "female" | "other")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Condition</Label>
        <ComboboxCreatable
          value={condValue}
          onChange={(val) => setValue("condition", val)}
          items={condPaginated.items}
          isLoading={condPaginated.isLoading}
          hasMore={condPaginated.hasMore}
          onSearch={condPaginated.onSearch}
          onLoadMore={condPaginated.onLoadMore}
          onCreate={async (name) => {
            setValue("condition", name);
            return { _id: name, name };
          }}
          placeholder="Select or create condition"
          searchPlaceholder="Search conditions..."
          selectedLabel={condValue}
        />
        {errors.condition && (
          <p className="text-sm text-destructive">
            {errors.condition.message}
          </p>
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
            placeholder="patient@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {!hideDoctor && (
        <div className="space-y-2">
          <Label>Doctor</Label>
          <ComboboxSearch
            value={docValue}
            onChange={(val) => {
              setValue("doctor", val);
              const item = doc.items.find((d) => d._id === val);
              if (item) setDocLabel(item.name);
            }}
            items={doc.items}
            isLoading={doc.isLoading}
            hasMore={doc.hasMore}
            onSearch={doc.onSearch}
            onLoadMore={doc.onLoadMore}
            placeholder="Select doctor"
            searchPlaceholder="Search doctors..."
            selectedLabel={docSelectedLabel}
          />
          {errors.doctor && (
            <p className="text-sm text-destructive">{errors.doctor.message}</p>
          )}
        </div>
      )}

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
