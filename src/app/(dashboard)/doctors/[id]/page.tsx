"use client";

import { useState } from "react";
import { useDoctor } from "@/hooks/use-doctors";
import { usePatients, useDeletePatient, useCreatePatient } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PatientForm } from "@/components/patients/patient-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { use } from "react";
import type { CreatePatientInput } from "@/lib/validations";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: doctor, isLoading: doctorLoading } = useDoctor(id);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const debouncedSearch = useDebounce(search);
  const deletePatient = useDeletePatient();
  const createPatient = useCreatePatient();

  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    doctor: id,
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deletePatient.mutateAsync(deleteId);
      toast.success("Patient removed successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to remove patient");
    }
  }

  async function handleAddPatient(data: CreatePatientInput) {
    try {
      await createPatient.mutateAsync({ ...data, doctor: id });
      toast.success("Patient added successfully");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add patient");
    }
  }

  if (doctorLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Doctor not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/doctors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{doctor.name}</h1>
          <p className="mt-1 text-muted-foreground">Doctor details and patients</p>
        </div>
      </div>

      {/* Doctor Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            {doctor.profileImage ? (
              <AvatarImage src={doctor.profileImage} alt={doctor.name} />
            ) : null}
            <AvatarFallback className="text-lg">
              {doctor.name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{doctor.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{doctor.specialization?.name}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Specialization</p>
                <p className="text-sm font-medium">
                  {doctor.specialization?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hospital</p>
                <p className="text-sm font-medium">{doctor.hospital?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{doctor.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{doctor.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Patients</h2>
        <div className="flex items-center gap-3">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by name e.g. John Smith"
            />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Patient to {doctor.name}</DialogTitle>
              </DialogHeader>
              <PatientForm
                onSubmit={handleAddPatient}
                isSubmitting={createPatient.isPending}
                hideDoctor
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {patientsLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {patientsData?.patients.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No patients found for this doctor.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsData?.patients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell className="capitalize">
                        {patient.gender}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.condition}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {patient.phone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(patient.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(patient._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {patientsData && patientsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {patientsData.patients.length} of {patientsData.total}{" "}
                patients
              </p>
              <PaginationControls
                page={patientsData.page}
                totalPages={patientsData.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Patient"
        description="Are you sure you want to remove this patient from this doctor?"
        onConfirm={handleDelete}
        loading={deletePatient.isPending}
      />
    </div>
  );
}
