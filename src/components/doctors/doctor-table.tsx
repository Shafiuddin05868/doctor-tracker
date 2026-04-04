"use client";

import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Doctor } from "@/hooks/use-doctors";
import { format } from "date-fns";

interface DoctorTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}

export function DoctorTable({ doctors, onEdit, onDelete }: DoctorTableProps) {
  if (doctors.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No doctors found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Patients</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {doctor.profileImage ? (
                      <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {doctor.name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{doctor.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {doctor.specialization?.name}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {doctor.hospital?.name}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {doctor.phone}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{doctor.patientCount ?? 0}</Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {format(new Date(doctor.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/doctors/${doctor._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(doctor)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doctor._id)}
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
  );
}
