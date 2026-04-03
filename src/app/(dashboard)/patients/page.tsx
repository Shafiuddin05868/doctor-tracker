"use client";

import { useState } from "react";
import { usePatients, useDeletePatient, useCreatePatient } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctors } from "@/hooks/use-doctors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import type { Patient } from "@/hooks/use-patients";
import type { CreatePatientInput } from "@/lib/validations";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const debouncedSearch = useDebounce(search);
  const deletePatient = useDeletePatient();
  const createPatient = useCreatePatient();
  const { data: doctorsData } = useDoctors({ limit: 100 });

  const { data, isLoading } = usePatients({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    condition: condition || undefined,
    doctor: doctorFilter || undefined,
  });

  // Get unique conditions from current data for filter
  const conditions = Array.from(
    new Set(data?.patients.map((p) => p.condition) ?? [])
  );

  function clearFilters() {
    setSearch("");
    setCondition("");
    setDoctorFilter("");
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deletePatient.mutateAsync(deleteId);
      toast.success("Patient deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete patient");
    }
  }

  async function handleAdd(data: CreatePatientInput) {
    try {
      await createPatient.mutateAsync(data);
      toast.success("Patient created successfully");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create patient");
    }
  }

  const hasFilters = search || condition || doctorFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="mt-1 text-muted-foreground">
            Manage patient records and information.
          </p>
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
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSubmit={handleAdd}
              isSubmitting={createPatient.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search patients..."
          />
        </div>

        <Select
          value={condition}
          onValueChange={(val) => {
            setCondition(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={doctorFilter}
          onValueChange={(val) => {
            setDoctorFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctorsData?.doctors.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {data?.patients.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No patients found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Gender
                    </TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Doctor
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Added
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.patients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell className="hidden sm:table-cell capitalize">
                        {patient.gender}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.condition}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {patient.doctor?.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {patient.phone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(patient.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditPatient(patient)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(patient._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.patients.length} of {data.total} patients
              </p>
              <PaginationControls
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <EditPatientDialog
        patient={editPatient}
        open={!!editPatient}
        onOpenChange={(open) => !open && setEditPatient(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? This action can be undone later."
        onConfirm={handleDelete}
        loading={deletePatient.isPending}
      />
    </div>
  );
}
