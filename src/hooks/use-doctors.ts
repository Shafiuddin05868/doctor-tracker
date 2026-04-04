import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { DoctorQuery, CreateDoctorInput, UpdateDoctorInput } from "@/lib/validations";

export interface Doctor {
  _id: string;
  name: string;
  specialization: { _id: string; name: string };
  hospital: { _id: string; name: string };
  phone: string;
  email: string;
  profileImage?: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  totalPages: number;
}

export function useDoctors(filters: Partial<DoctorQuery> = {}) {
  return useQuery<DoctorsResponse>({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      const { data } = await api.get("/doctors", { params: filters });
      return data;
    },
  });
}

export function useDoctor(id: string) {
  return useQuery<Doctor>({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDoctorInput) => {
      const { data } = await api.post("/doctors", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateDoctorInput & { id: string }) => {
      const { data } = await api.put(`/doctors/${id}`, input);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/doctors/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
