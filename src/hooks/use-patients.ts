import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  PatientQuery,
  CreatePatientInput,
  UpdatePatientInput,
} from "@/lib/validations";

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email: string;
  doctor: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

export function usePatients(filters: Partial<PatientQuery> = {}) {
  return useQuery<PatientsResponse>({
    queryKey: ["patients", filters],
    queryFn: async () => {
      const { data } = await api.get("/patients", { params: filters });
      return data;
    },
  });
}

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      const { data } = await api.post("/patients", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdatePatientInput & { id: string }) => {
      const { data } = await api.put(`/patients/${id}`, input);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/patients/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
