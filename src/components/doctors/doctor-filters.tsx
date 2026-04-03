"use client";

import { SearchInput } from "@/components/search-input";
import { useSpecializations } from "@/hooks/use-specializations";
import { useHospitals } from "@/hooks/use-hospitals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DoctorFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  specialization: string;
  onSpecializationChange: (value: string) => void;
  hospital: string;
  onHospitalChange: (value: string) => void;
  onClear: () => void;
}

export function DoctorFilters({
  search,
  onSearchChange,
  specialization,
  onSpecializationChange,
  hospital,
  onHospitalChange,
  onClear,
}: DoctorFiltersProps) {
  const { data: specializations } = useSpecializations();
  const { data: hospitals } = useHospitals();

  const hasFilters = search || specialization || hospital;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:max-w-xs">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search doctors..."
        />
      </div>

      <Select value={specialization} onValueChange={onSpecializationChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Specialization" />
        </SelectTrigger>
        <SelectContent>
          {specializations?.map((s) => (
            <SelectItem key={s._id} value={s._id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={hospital} onValueChange={onHospitalChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Hospital" />
        </SelectTrigger>
        <SelectContent>
          {hospitals?.map((h) => (
            <SelectItem key={h._id} value={h._id}>
              {h.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
