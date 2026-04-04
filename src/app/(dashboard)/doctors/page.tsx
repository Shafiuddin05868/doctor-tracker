"use client";

import { useState } from "react";
import { useDoctors, useDeleteDoctor, type Doctor } from "@/hooks/use-doctors";
import { useDebounce } from "@/hooks/use-debounce";
import { DoctorTable } from "@/components/doctors/doctor-table";
import { DoctorFilters } from "@/components/doctors/doctor-filters";
import { AddDoctorDialog } from "@/components/doctors/add-doctor-dialog";
import { EditDoctorDialog } from "@/components/doctors/edit-doctor-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);

  const debouncedSearch = useDebounce(search);
  const deleteDoctor = useDeleteDoctor();

  const { data, isLoading } = useDoctors({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    specialization: specialization || undefined,
    hospital: hospital || undefined,
  });

  function clearFilters() {
    setSearch("");
    setSpecialization("");
    setHospital("");
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteDoctor.mutateAsync(deleteId);
      toast.success("Doctor deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete doctor");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="mt-1 text-muted-foreground">
            Manage doctors and their information.
          </p>
        </div>
        <AddDoctorDialog />
      </div>

      <DoctorFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        specialization={specialization}
        onSpecializationChange={(val) => {
          setSpecialization(val);
          setPage(1);
        }}
        hospital={hospital}
        onHospitalChange={(val) => {
          setHospital(val);
          setPage(1);
        }}
        onClear={clearFilters}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <DoctorTable
            doctors={data?.doctors ?? []}
            onEdit={setEditDoctor}
            onDelete={setDeleteId}
          />

          {data && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.doctors.length} of {data.total} doctors
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

      <EditDoctorDialog
        doctor={editDoctor}
        open={!!editDoctor}
        onOpenChange={(open) => !open && setEditDoctor(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Doctor"
        description="Are you sure you want to delete this doctor? This action can be undone later."
        onConfirm={handleDelete}
        loading={deleteDoctor.isPending}
      />
    </div>
  );
}
