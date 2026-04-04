"use client";

import { useState } from "react";
import {
  useHospitals,
  useCreateHospital,
  useUpdateHospital,
  useDeleteHospital,
} from "@/hooks/use-hospitals";
import {
  useSpecializations,
  useCreateSpecialization,
  useUpdateSpecialization,
  useDeleteSpecialization,
} from "@/hooks/use-specializations";
import { useDebounce } from "@/hooks/use-debounce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { HospitalForm } from "@/components/hospitals/hospital-form";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import type { CreateHospitalInput, CreateSpecializationInput } from "@/lib/validations";
import type { Hospital } from "@/hooks/use-hospitals";
import type { Specialization } from "@/hooks/use-specializations";

// ─── Hospitals Tab ───────────────────────────────────────────

function HospitalsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editHospital, setEditHospital] = useState<Hospital | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useHospitals({
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });
  const createHospital = useCreateHospital();
  const updateHospital = useUpdateHospital();
  const deleteHospital = useDeleteHospital();

  async function handleCreate(input: CreateHospitalInput) {
    try {
      await createHospital.mutateAsync(input);
      toast.success("Hospital created");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create hospital");
    }
  }

  async function handleUpdate(input: CreateHospitalInput) {
    if (!editHospital) return;
    try {
      await updateHospital.mutateAsync({ id: editHospital._id, ...input });
      toast.success("Hospital updated");
      setEditHospital(null);
    } catch {
      toast.error("Failed to update hospital");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteHospital.mutateAsync(deleteId);
      toast.success("Hospital deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete hospital");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search hospitals..."
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Hospital</DialogTitle>
            </DialogHeader>
            <HospitalForm
              onSubmit={handleCreate}
              isSubmitting={createHospital.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {(data?.items.length ?? 0) === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No hospitals found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Address</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((hospital) => (
                    <TableRow key={hospital._id}>
                      <TableCell className="font-medium">{hospital.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {hospital.address}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {hospital.city}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {hospital.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditHospital(hospital)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(hospital._id)}
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
                Showing {data.items.length} of {data.total} hospitals
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

      {/* Edit Dialog */}
      <Dialog open={!!editHospital} onOpenChange={(open) => !open && setEditHospital(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
          </DialogHeader>
          {editHospital && (
            <HospitalForm
              defaultValues={{
                name: editHospital.name,
                address: editHospital.address,
                city: editHospital.city,
                phone: editHospital.phone,
              }}
              onSubmit={handleUpdate}
              isSubmitting={updateHospital.isPending}
              submitLabel="Update Hospital"
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Hospital"
        description="Are you sure you want to delete this hospital?"
        onConfirm={handleDelete}
        loading={deleteHospital.isPending}
      />
    </div>
  );
}

// ─── Specializations Tab ─────────────────────────────────────

function SpecializationsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editSpec, setEditSpec] = useState<Specialization | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useSpecializations({
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });
  const createSpec = useCreateSpecialization();
  const updateSpec = useUpdateSpecialization();
  const deleteSpec = useDeleteSpecialization();

  function openEdit(spec: Specialization) {
    setEditSpec(spec);
    setEditName(spec.name);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createSpec.mutateAsync({ name: newName.trim() });
      toast.success("Specialization created");
      setNewName("");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create specialization");
    }
  }

  async function handleUpdate() {
    if (!editSpec || !editName.trim()) return;
    try {
      await updateSpec.mutateAsync({ id: editSpec._id, name: editName.trim() });
      toast.success("Specialization updated");
      setEditSpec(null);
    } catch {
      toast.error("Failed to update specialization");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteSpec.mutateAsync(deleteId);
      toast.success("Specialization deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete specialization");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search specializations..."
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Specialization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add New Specialization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spec-name">Name</Label>
                <Input
                  id="spec-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Nephrology"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createSpec.isPending}
                className="w-full"
              >
                {createSpec.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Specialization"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {(data?.items.length ?? 0) === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No specializations found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((spec) => (
                    <TableRow key={spec._id}>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(spec)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(spec._id)}
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
                Showing {data.items.length} of {data.total} specializations
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

      {/* Edit Dialog */}
      <Dialog open={!!editSpec} onOpenChange={(open) => !open && setEditSpec(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Specialization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-spec-name">Name</Label>
              <Input
                id="edit-spec-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdate}
              disabled={updateSpec.isPending}
              className="w-full"
            >
              {updateSpec.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Specialization"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Specialization"
        description="Are you sure you want to delete this specialization?"
        onConfirm={handleDelete}
        loading={deleteSpec.isPending}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function HospitalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hospitals & Specializations</h1>
        <p className="mt-1 text-muted-foreground">
          Manage hospitals and medical specializations.
        </p>
      </div>

      <Tabs defaultValue="hospitals">
        <TabsList>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="specializations">Specializations</TabsTrigger>
        </TabsList>
        <TabsContent value="hospitals" className="mt-4">
          <HospitalsTab />
        </TabsContent>
        <TabsContent value="specializations" className="mt-4">
          <SpecializationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
