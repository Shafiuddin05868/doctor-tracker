"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { useCreateDoctor } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { CreateDoctorInput } from "@/lib/validations";

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const createDoctor = useCreateDoctor();

  async function handleSubmit(data: CreateDoctorInput) {
    try {
      await createDoctor.mutateAsync(data);
      toast.success("Doctor created successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to create doctor");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
        </DialogHeader>
        <DoctorForm
          onSubmit={handleSubmit}
          isSubmitting={createDoctor.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
