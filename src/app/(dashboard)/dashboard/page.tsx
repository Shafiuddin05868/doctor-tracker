"use client";

import { useState, useMemo } from "react";
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

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState<DatePreset>("all");
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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
    if (preset !== "custom") {
      setCalendarRange(undefined);
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

      {/* Date range presets + custom calendar */}
      <div className="overflow-x-auto">
        <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetClick(preset.value)}
              className={cn(
                "h-8 shrink-0 text-xs font-medium",
                activePreset === preset.value &&
                  "bg-background text-foreground shadow-sm"
              )}
            >
              {preset.label}
            </Button>
          ))}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 shrink-0 gap-1.5 text-xs font-medium",
                  activePreset === "custom" &&
                    "bg-background text-foreground shadow-sm"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {calendarLabel}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Select date range</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 py-4">
                {/* Month & Year selects */}
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
                    <SelectContent>
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
                    <SelectContent>
                      {Array.from(
                        { length: new Date().getFullYear() - 2020 + 1 },
                        (_, i) => {
                          const year = 2020 + i;
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
                    onSelect={handleCalendarSelect}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                  />
                </div>
              </div>
              {calendarRange?.from && (
                <div className="border-t px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setCalendarRange(undefined);
                      setActivePreset("all");
                    }}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
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
