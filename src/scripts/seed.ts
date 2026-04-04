import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { Specialization } from "../models/Specialization";
import { Hospital } from "../models/Hospital";

const MONGODB_URI = process.env.MONGODB_URI!;

const baseSpecializations = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
  "General Surgery", "Neurology", "Oncology", "Ophthalmology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Pulmonology",
  "Radiology", "Urology", "Nephrology", "Rheumatology",
  "Hematology", "Immunology", "Geriatrics", "Anesthesiology",
  "Pathology", "Emergency Medicine", "Family Medicine", "Internal Medicine",
  "Obstetrics", "Gynecology", "Neonatology", "Plastic Surgery",
  "Vascular Surgery", "Thoracic Surgery", "Neurosurgery", "Cardiac Surgery",
  "Sports Medicine", "Pain Management", "Infectious Disease", "Allergy",
  "Palliative Care", "Nuclear Medicine", "Rehabilitative Medicine",
  "Preventive Medicine", "Sleep Medicine", "Toxicology", "Genetics",
  "Forensic Medicine", "Occupational Medicine", "Tropical Medicine",
  "Adolescent Medicine", "Critical Care", "Hepatology", "Bariatric Medicine",
];

const prefixes = [
  "Advanced", "Modern", "Clinical", "Applied", "Interventional",
  "Diagnostic", "Therapeutic", "Pediatric", "Adult", "Surgical",
];

const hospitalPrefixes = [
  "City", "Metro", "Valley", "Sunrise", "Lakewood", "Central", "Riverside",
  "Highland", "Pacific", "Atlantic", "Mountain", "Golden", "Silver", "Royal",
  "Prime", "Elite", "Unity", "Hope", "Grace", "Mercy", "Providence",
  "Heritage", "Phoenix", "Liberty", "Eagle", "Star", "Crown", "Beacon",
];

const hospitalSuffixes = [
  "General Hospital", "Medical Center", "Health System", "Community Hospital",
  "Regional Medical Center", "University Hospital", "Memorial Hospital",
  "Children's Hospital", "Specialty Clinic", "Medical Plaza",
];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "San Francisco", "Columbus", "Indianapolis",
  "Charlotte", "Seattle", "Denver", "Nashville", "Portland",
  "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee",
  "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa",
  "Kansas City", "Atlanta", "Omaha", "Colorado Springs", "Raleigh",
  "Long Beach", "Virginia Beach", "Miami", "Oakland", "Minneapolis",
  "Tampa", "Tulsa", "Arlington", "New Orleans", "Wichita",
  "Cleveland", "Bakersfield", "Aurora", "Anaheim", "Honolulu",
];

const conditions = [
  "Hypertension", "Diabetes Type 2", "Asthma", "Migraine", "Arthritis",
  "Chronic Back Pain", "Depression", "Anxiety Disorder", "GERD",
  "Hypothyroidism", "Allergic Rhinitis", "Eczema", "Anemia", "Obesity",
  "Insomnia", "COPD", "Heart Failure", "Atrial Fibrillation",
  "Kidney Disease", "Liver Disease", "Pneumonia", "Bronchitis",
  "Osteoporosis", "Gout", "Psoriasis", "Lupus", "Fibromyalgia",
  "Celiac Disease", "Crohn's Disease", "Ulcerative Colitis",
];

const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
  "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley",
  "Andrew", "Dorothy", "Paul", "Kimberly", "Joshua", "Emily", "Kenneth", "Donna",
  "Kevin", "Michelle", "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa",
  "Ronald", "Deborah", "Edward", "Stephanie", "Jason", "Rebecca", "Jeffrey", "Sharon",
  "Ryan", "Laura", "Jacob", "Cynthia", "Gary", "Kathleen", "Nicholas", "Amy",
  "Eric", "Angela", "Jonathan", "Shirley", "Stephen", "Anna", "Larry", "Brenda",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
  "Campbell", "Mitchell", "Carter", "Roberts",
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

function randomAddress(): string {
  const num = Math.floor(100 + Math.random() * 9900);
  const streets = ["Main St", "Oak Ave", "Pine Rd", "Elm Blvd", "Cedar Ln", "Maple Way", "Walnut Ct", "Birch Dr", "Spruce Pl", "Ash St"];
  return `${num} ${randomFrom(streets)}`;
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

  // Generate 500 specializations
  const specNames = new Set<string>();
  for (const base of baseSpecializations) {
    specNames.add(base);
  }
  while (specNames.size < 500) {
    const prefix = randomFrom(prefixes);
    const base = randomFrom(baseSpecializations);
    specNames.add(`${prefix} ${base}`);
  }
  const specDocs = await Specialization.insertMany(
    Array.from(specNames).map((name) => ({ name }))
  );
  console.log(`Created ${specDocs.length} specializations.`);

  // Generate 5000 hospitals
  const hospData = [];
  const hospNames = new Set<string>();
  while (hospNames.size < 5000) {
    const prefix = randomFrom(hospitalPrefixes);
    const suffix = randomFrom(hospitalSuffixes);
    const city = randomFrom(cities);
    const name = `${prefix} ${suffix} - ${city} #${hospNames.size + 1}`;
    hospNames.add(name);
    hospData.push({
      name,
      address: randomAddress(),
      city,
      phone: randomPhone(),
    });
  }
  // Insert in batches of 1000
  const hospDocs = [];
  for (let i = 0; i < hospData.length; i += 1000) {
    const batch = await Hospital.insertMany(hospData.slice(i, i + 1000));
    hospDocs.push(...batch);
    console.log(`  Hospitals: ${hospDocs.length} / ${hospData.length}`);
  }
  console.log(`Created ${hospDocs.length} hospitals.`);

  // Generate 3000 doctors
  const doctorData = [];
  for (let i = 0; i < 3000; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    doctorData.push({
      name: `Dr. ${firstName} ${lastName}`,
      specialization: randomFrom(specDocs)._id,
      hospital: randomFrom(hospDocs)._id,
      phone: randomPhone(),
      email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@hospital.com`,
      createdAt: randomDate(24),
    });
  }
  const doctorDocs = [];
  for (let i = 0; i < doctorData.length; i += 1000) {
    const batch = await Doctor.insertMany(doctorData.slice(i, i + 1000));
    doctorDocs.push(...batch);
    console.log(`  Doctors: ${doctorDocs.length} / ${doctorData.length}`);
  }
  console.log(`Created ${doctorDocs.length} doctors.`);

  // Generate 10000 patients
  const patientData = [];
  for (let i = 0; i < 10000; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    patientData.push({
      name: `${firstName} ${lastName}`,
      age: Math.floor(1 + Math.random() * 95),
      gender: randomFrom(["male", "female", "other"] as const),
      condition: randomFrom(conditions),
      phone: randomPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@email.com`,
      doctor: randomFrom(doctorDocs)._id,
      createdAt: randomDate(24),
    });
  }
  const patientDocs = [];
  for (let i = 0; i < patientData.length; i += 1000) {
    const batch = await Patient.insertMany(patientData.slice(i, i + 1000));
    patientDocs.push(...batch);
    console.log(`  Patients: ${patientDocs.length} / ${patientData.length}`);
  }
  console.log(`Created ${patientDocs.length} patients.`);

  console.log("\nSeed complete!");
  console.log(`Total: ${specDocs.length} specializations, ${hospDocs.length} hospitals, ${doctorDocs.length} doctors, ${patientDocs.length} patients`);
  console.log("Login: admin@doctortracker.com / admin123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
