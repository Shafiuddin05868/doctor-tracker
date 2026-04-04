"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { useUpdateDoctor } from "@/hooks/use-doctors";
import { toast } from "sonner";
import type { Doctor } from "@/hooks/use-doctors";
import type { CreateDoctorInput } from "@/lib/validations";

interface EditDoctorDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDoctorDialog({
  doctor,
  open,
  onOpenChange,
}: EditDoctorDialogProps) {
  const updateDoctor = useUpdateDoctor();

  async function handleSubmit(data: CreateDoctorInput) {
    if (!doctor) return;
    try {
      await updateDoctor.mutateAsync({ id: doctor._id, ...data });
      toast.success("Doctor updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update doctor");
    }
  }

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
        </DialogHeader>
        <DoctorForm
          defaultValues={{
            name: doctor.name,
            specialization: doctor.specialization?._id,
            hospital: doctor.hospital?._id,
            phone: doctor.phone,
            email: doctor.email,
            profileImage: doctor.profileImage,
          }}
          defaultLabels={{
            specialization: doctor.specialization?.name,
            hospital: doctor.hospital?.name,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateDoctor.isPending}
          submitLabel="Update Doctor"
        />
      </DialogContent>
    </Dialog>
  );
}
