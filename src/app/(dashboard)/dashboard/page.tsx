"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopDoctorsChart } from "@/components/dashboard/top-doctors-chart";
import { MonthlyTrendsChart } from "@/components/dashboard/monthly-trends-chart";
import { ConditionDistributionChart } from "@/components/dashboard/condition-distribution-chart";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

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

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDoctorsChart data={stats.topDoctorsByPatients} />
        <MonthlyTrendsChart data={stats.monthlyTrends} />
      </div>

      <ConditionDistributionChart data={stats.conditionDistribution} />
    </div>
  );
}
