import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface ConditionsResponse {
  items: { _id: string; name: string }[];
  total: number;
  page: number;
  totalPages: number;
}

export function useConditions(filters: { search?: string; page?: number; limit?: number } = {}) {
  return useQuery<ConditionsResponse>({
    queryKey: ["conditions", filters],
    queryFn: async () => {
      const { data } = await api.get("/conditions", { params: filters });
      return data;
    },
  });
}
