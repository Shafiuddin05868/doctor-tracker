import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  topDoctorsByPatients: { name: string; count: number }[];
  monthlyTrends: { month: string; patients: number }[];
  conditionDistribution: { condition: string; count: number }[];
}

interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
}

export function useDashboardStats(filters: DashboardFilters = {}) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", filters],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats", { params: filters });
      return data;
    },
  });
}
