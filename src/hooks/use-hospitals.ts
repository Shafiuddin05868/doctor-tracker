import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { CreateHospitalInput, UpdateHospitalInput } from "@/lib/validations";

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface HospitalsResponse {
  items: Hospital[];
  total: number;
  page: number;
  totalPages: number;
}

export function useHospitals(filters: { search?: string; page?: number; limit?: number } = {}) {
  return useQuery<HospitalsResponse>({
    queryKey: ["hospitals", filters],
    queryFn: async () => {
      const { data } = await api.get("/hospitals", { params: filters });
      return data;
    },
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHospitalInput) => {
      const { data } = await api.post("/hospitals", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateHospitalInput & { id: string }) => {
      const { data } = await api.put(`/hospitals/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/hospitals/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}
