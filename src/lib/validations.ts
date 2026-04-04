import { z } from "zod/v4";

// --- Auth ---
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Specialization ---
export const createSpecializationSchema = z.object({
  name: z.string().min(2, "Specialization name must be at least 2 characters"),
});

// --- Hospital ---
export const createHospitalSchema = z.object({
  name: z.string().min(2, "Hospital name must be at least 2 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

export const updateHospitalSchema = createHospitalSchema.partial();

// --- Doctor ---
export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.string().min(1, "Specialization ID is required"),
  hospital: z.string().min(1, "Hospital ID is required"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  email: z.email("Invalid email address"),
});

export const updateDoctorSchema = createDoctorSchema.partial();

// --- Patient ---
export const createPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().int().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  condition: z.string().min(2, "Condition is required"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.email("Invalid email address").optional()
  ),
  doctor: z.string().min(1, "Doctor ID is required"),
});

export const updatePatientSchema = createPatientSchema
  .omit({ doctor: true })
  .partial();

// --- Query Params ---
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const doctorQuerySchema = paginationSchema.extend({
  specialization: z.string().optional(),
  hospital: z.string().optional(),
});

export const patientQuerySchema = paginationSchema.extend({
  condition: z.string().optional(),
  doctor: z.string().optional(),
});

// --- Types ---
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSpecializationInput = z.infer<
  typeof createSpecializationSchema
>;
export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
export type PatientQuery = z.infer<typeof patientQuerySchema>;
