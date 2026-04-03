"use client";

import { useState, useMemo, useEffect } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopDoctorsChart } from "@/components/dashboard/top-doctors-chart";
import { MonthlyTrendsChart } from "@/components/dashboard/monthly-trends-chart";
import { ConditionDistributionChart } from "@/components/dashboard/condition-distribution-chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { subDays, subMonths, format, setMonth, setYear } from "date-fns";
import type { DateRange } from "react-day-picker";

type DatePreset = "7d" | "30d" | "3m" | "12m" | "all" | "custom";

const presets: { label: string; value: DatePreset }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 12 months", value: "12m" },
  { label: "All time", value: "all" },
];

function getPresetDateRange(preset: DatePreset) {
  if (preset === "all" || preset === "custom") return {};

  const now = new Date();
  let from: Date;

  switch (preset) {
    case "7d":
      from = subDays(now, 7);
      break;
    case "30d":
      from = subDays(now, 30);
      break;
    case "3m":
      from = subMonths(now, 3);
      break;
    case "12m":
      from = subMonths(now, 12);
      break;
  }

  return {
    dateFrom: format(from, "yyyy-MM-dd"),
    dateTo: format(now, "yyyy-MM-dd"),
  };
}

function DatePickerContent({
  calendarMonth,
  setCalendarMonth,
  calendarRange,
  onSelect,
  onClear,
}: {
  calendarMonth: Date;
  setCalendarMonth: (fn: (prev: Date) => Date) => void;
  calendarRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center justify-center gap-2">
        <Select
          value={String(calendarMonth.getMonth())}
          onValueChange={(val) =>
            setCalendarMonth((prev) => setMonth(prev, Number(val)))
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-48">
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={String(i)}>
                {format(new Date(2024, i), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(calendarMonth.getFullYear())}
          onValueChange={(val) =>
            setCalendarMonth((prev) => setYear(prev, Number(val)))
          }
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-48">
            {Array.from(
              { length: new Date().getFullYear() - 2000 + 1 },
              (_, i) => {
                const year = 2000 + i;
                return (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                );
              }
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="range"
          selected={calendarRange}
          onSelect={onSelect}
          month={calendarMonth}
          onMonthChange={(m) => setCalendarMonth(() => m)}
          numberOfMonths={1}
          disabled={{ after: new Date() }}
        />
      </div>

      {calendarRange?.from && (
        <div className="border-t px-4 py-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={onClear}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [activePreset, setActivePreset] = useState<DatePreset>("all");
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = useMemo(() => {
    if (activePreset === "custom" && calendarRange?.from && calendarRange?.to) {
      return {
        dateFrom: format(calendarRange.from, "yyyy-MM-dd"),
        dateTo: format(calendarRange.to, "yyyy-MM-dd"),
      };
    }
    if (activePreset === "custom") return {}; // wait until both dates selected
    return getPresetDateRange(activePreset);
  }, [activePreset, calendarRange]);

  const { data: stats, isLoading, error } = useDashboardStats(filters);

  function handlePresetClick(preset: DatePreset) {
    setActivePreset(preset);
    if (preset === "custom") {
      setSheetOpen(true);
    } else {
      setCalendarRange(undefined);
      setSheetOpen(false);
    }
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setCalendarRange(range);
    setActivePreset("custom");
  }

  const calendarLabel = useMemo(() => {
    if (activePreset !== "custom" || !calendarRange?.from) return "Custom";
    const from = format(calendarRange.from, "MMM d, yyyy");
    const to = calendarRange.to
      ? format(calendarRange.to, "MMM d, yyyy")
      : from;
    return `${from} - ${to}`;
  }, [activePreset, calendarRange]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Failed to load dashboard stats.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of doctors and patients analytics.
        </p>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2">
        <Select
          value={activePreset}
          onValueChange={(val) => handlePresetClick(val as DatePreset)}
        >
          <SelectTrigger className="w-48">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">
              {activePreset === "custom" && calendarRange?.from
                ? calendarLabel
                : "Custom range"}
            </SelectItem>
          </SelectContent>
        </Select>

        {activePreset === "custom" && isDesktop && (
          <Popover open={sheetOpen} onOpenChange={setSheetOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {calendarRange?.from ? calendarLabel : "Pick dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <DatePickerContent
                calendarMonth={calendarMonth}
                setCalendarMonth={setCalendarMonth}
                calendarRange={calendarRange}
                onSelect={handleCalendarSelect}
                onClear={() => {
                  setCalendarRange(undefined);
                  setActivePreset("all");
                  setSheetOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        )}

        {activePreset === "custom" && !isDesktop && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {calendarRange?.from ? calendarLabel : "Pick dates"}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Select date range</SheetTitle>
              </SheetHeader>
              <DatePickerContent
                calendarMonth={calendarMonth}
                setCalendarMonth={setCalendarMonth}
                calendarRange={calendarRange}
                onSelect={handleCalendarSelect}
                onClear={() => {
                  setCalendarRange(undefined);
                  setActivePreset("all");
                  setSheetOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDoctorsChart data={stats.topDoctorsByPatients} />
        <MonthlyTrendsChart data={stats.monthlyTrends} />
      </div>

      <ConditionDistributionChart data={stats.conditionDistribution} />
    </div>
  );
}
