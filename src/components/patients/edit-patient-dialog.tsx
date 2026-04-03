"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/patients/patient-form";
import { useUpdatePatient } from "@/hooks/use-patients";
import { toast } from "sonner";
import type { Patient } from "@/hooks/use-patients";
import type { CreatePatientInput } from "@/lib/validations";

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: EditPatientDialogProps) {
  const updatePatient = useUpdatePatient();

  async function handleSubmit(data: CreatePatientInput) {
    if (!patient) return;
    try {
      await updatePatient.mutateAsync({ id: patient._id, ...data });
      toast.success("Patient updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update patient");
    }
  }

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        <PatientForm
          defaultValues={{
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            condition: patient.condition,
            phone: patient.phone,
            email: patient.email,
            doctor: patient.doctor._id,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updatePatient.isPending}
          submitLabel="Update Patient"
        />
      </DialogContent>
    </Dialog>
  );
}
