import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { CreateSpecializationInput } from "@/lib/validations";

export interface Specialization {
  _id: string;
  name: string;
}

interface SpecializationsResponse {
  items: Specialization[];
  total: number;
  page: number;
  totalPages: number;
}

export function useSpecializations(filters: { search?: string; page?: number; limit?: number } = {}) {
  return useQuery<SpecializationsResponse>({
    queryKey: ["specializations", filters],
    queryFn: async () => {
      const { data } = await api.get("/specializations", { params: filters });
      return data;
    },
  });
}

export function useCreateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpecializationInput) => {
      const { data } = await api.post("/specializations", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
  });
}

export function useUpdateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateSpecializationInput & { id: string }) => {
      const { data } = await api.put(`/specializations/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
  });
}

export function useDeleteSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/specializations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
  });
}
