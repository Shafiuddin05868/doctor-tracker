"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, UserCheck, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/hooks/use-dashboard-stats";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      trend: "Active in system",
      trendIcon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      trend: "Registered patients",
      trendIcon: TrendingUp,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Avg Patients / Doctor",
      value: stats.avgPatientsPerDoctor,
      icon: UserCheck,
      trend: "Average patient load",
      trendIcon: TrendingUp,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {card.value.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <card.trendIcon className={`h-3 w-3 ${card.color}`} />
              <span>{card.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
