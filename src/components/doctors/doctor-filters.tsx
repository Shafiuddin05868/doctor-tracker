"use client";

import { useEffect } from "react";
import { SearchInput } from "@/components/search-input";
import { ComboboxSearch } from "@/components/combobox-search";
import { useSpecializations } from "@/hooks/use-specializations";
import { useHospitals } from "@/hooks/use-hospitals";
import { usePaginatedItems } from "@/hooks/use-paginated-items";
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
  const spec = usePaginatedItems();
  const specQuery = useSpecializations({
    search: spec.search || undefined,
    page: spec.page,
    limit: 30,
  });
  useEffect(() => {
    spec.setQueryResult(specQuery.data ?? undefined, specQuery.isLoading);
  }, [specQuery.data, specQuery.isLoading, spec.setQueryResult]);

  const hosp = usePaginatedItems();
  const hospQuery = useHospitals({
    search: hosp.search || undefined,
    page: hosp.page,
    limit: 30,
  });
  useEffect(() => {
    hosp.setQueryResult(hospQuery.data ?? undefined, hospQuery.isLoading);
  }, [hospQuery.data, hospQuery.isLoading, hosp.setQueryResult]);

  const specLabel = spec.items.find((s) => s._id === specialization)?.name || "";
  const hospLabel = hosp.items.find((h) => h._id === hospital)?.name || "";

  const hasFilters = search || specialization || hospital;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:max-w-xs">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name e.g. Melissa Clark"
        />
      </div>

      <div className="w-full sm:w-48">
        <ComboboxSearch
          value={specialization}
          onChange={onSpecializationChange}
          items={spec.items}
          isLoading={spec.isLoading}
          hasMore={spec.hasMore}
          onSearch={spec.onSearch}
          onLoadMore={spec.onLoadMore}
          placeholder="Specialization"
          searchPlaceholder="Search..."
          selectedLabel={specLabel}
          clearable
        />
      </div>

      <div className="w-full sm:w-48">
        <ComboboxSearch
          value={hospital}
          onChange={onHospitalChange}
          items={hosp.items}
          isLoading={hosp.isLoading}
          hasMore={hosp.hasMore}
          onSearch={hosp.onSearch}
          onLoadMore={hosp.onLoadMore}
          placeholder="Hospital"
          searchPlaceholder="Search..."
          selectedLabel={hospLabel}
          clearable
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
