import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";
import { Specialization } from "@/models/Specialization";
import { Hospital } from "@/models/Hospital";

const MONGODB_URI = process.env.MONGODB_URI!;

const specializations = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
];

const hospitals = [
  { name: "City General Hospital", address: "123 Main St", city: "New York", phone: "212-555-0100" },
  { name: "St. Mary's Medical Center", address: "456 Oak Ave", city: "Los Angeles", phone: "310-555-0200" },
  { name: "Metro Health System", address: "789 Pine Rd", city: "Chicago", phone: "312-555-0300" },
  { name: "Valley Regional Hospital", address: "101 Elm Blvd", city: "Houston", phone: "713-555-0400" },
  { name: "Sunrise Medical Center", address: "202 Cedar Ln", city: "Phoenix", phone: "602-555-0500" },
  { name: "Lakewood Community Hospital", address: "303 Birch Dr", city: "Philadelphia", phone: "215-555-0600" },
  { name: "Central Medical Plaza", address: "404 Maple Way", city: "San Antonio", phone: "210-555-0700" },
  { name: "Riverside General Hospital", address: "505 Walnut Ct", city: "San Diego", phone: "619-555-0800" },
];

const conditions = [
  "Hypertension",
  "Diabetes Type 2",
  "Asthma",
  "Migraine",
  "Arthritis",
  "Chronic Back Pain",
  "Depression",
  "Anxiety Disorder",
  "GERD",
  "Hypothyroidism",
  "Allergic Rhinitis",
  "Eczema",
  "Anemia",
  "Obesity",
  "Insomnia",
];

const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
  "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const area = Math.floor(200 + Math.random() * 800);
  const mid = Math.floor(100 + Math.random() * 900);
  const end = Math.floor(1000 + Math.random() * 9000);
  return `${area}-${mid}-${end}`;
}

function randomDate(monthsBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - monthsBack * 30 * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Specialization.deleteMany({}),
    Hospital.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // Seed admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await User.create({
    name: "Admin",
    email: "admin@doctortracker.com",
    password: hashedPassword,
  });
  console.log("Created admin user: admin@doctortracker.com / admin123");

  // Seed specializations
  const specDocs = await Specialization.insertMany(
    specializations.map((name) => ({ name }))
  );
  console.log(`Created ${specDocs.length} specializations.`);

  // Seed hospitals
  const hospDocs = await Hospital.insertMany(hospitals);
  console.log(`Created ${hospDocs.length} hospitals.`);

  // Seed doctors
  const doctorData = [];
  for (let i = 0; i < 20; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    doctorData.push({
      name: `Dr. ${firstName} ${lastName}`,
      specialization: randomFrom(specDocs)._id,
      hospital: randomFrom(hospDocs)._id,
      phone: randomPhone(),
      email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hospital.com`,
      createdAt: randomDate(12),
    });
  }
  const doctorDocs = await Doctor.insertMany(doctorData);
  console.log(`Created ${doctorDocs.length} doctors.`);

  // Seed patients
  const patientData = [];
  for (let i = 0; i < 100; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    patientData.push({
      name: `${firstName} ${lastName}`,
      age: Math.floor(18 + Math.random() * 65),
      gender: randomFrom(["male", "female", "other"] as const),
      condition: randomFrom(conditions),
      phone: randomPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      doctor: randomFrom(doctorDocs)._id,
      createdAt: randomDate(12),
    });
  }
  const patientDocs = await Patient.insertMany(patientData);
  console.log(`Created ${patientDocs.length} patients.`);

  console.log("\nSeed complete!");
  console.log("Login: admin@doctortracker.com / admin123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
