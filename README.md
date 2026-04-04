# Doctor Tracker

Doctor Tracker is a secure administrative web application that allows authenticated users to manage doctors and their corresponding patients. The system features a real-time analytics dashboard with data visualization, full CRUD operations for doctors, patients, hospitals, and specializations, advanced search/filter/pagination with searchable comboboxes, optional doctor profile image uploads via ImageKit, and a modern responsive UI built with Next.js 16, MongoDB, and Tailwind CSS.

---

## Setup Guide

### Prerequisites

- **Node.js** 20.9+ (or Bun 1.x)
- **MongoDB Atlas** account (or local MongoDB instance)
- **ImageKit** account (optional — for doctor profile image uploads)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:Shafiuddin05868/doctor-tracker.git
   cd doctor-tracker
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:

   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/doctor-tracker
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_URL=http://localhost:3000

   # Optional — for doctor profile image upload
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
   IMAGEKIT_PRIVATE_KEY=your-private-key
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id/
   ```

4. **Seed the database**

   ```bash
   bun run seed
   ```

   This creates:
   - Admin user: `admin@doctortracker.com` / `admin123`
   - 500 specializations, 5,000 hospitals
   - 3,000 doctors, 10,000 patients
   - Total: ~18,500 records for scalability testing

5. **Start the development server**

   ```bash
   bun run dev
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) and log in with the seeded credentials.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
│  ┌───────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  React Query  │  │   Zustand    │  │  React Hook Form  │ │
│  │ (server state)│  │(client state)│  │  + Zod validation │ │
│  └──────┬────────┘  └──────────────┘  └───────────────────┘ │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │              Next.js App Router (Pages)             │    │
│  │  Dashboard │ Doctors │ Patients │ Hospitals │ Login │    │
│  └──────────────────────────┬──────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTP (axios)
┌─────────────────────────────┼───────────────────────────────┐
│                     Next.js Server                          │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │              API Route Handlers (/api/*)            │    │
│  │  Auth check → Zod validation → Mongoose query       │    │
│  └──────────────────────────┬──────────────────────────┘    │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │                proxy.ts (auth guard)                │    │
│  │  Redirects unauthenticated users to /login          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NextAuth.js v5 (JWT sessions)           │   │
│  │  Credentials provider → bcrypt password verification │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────┬───────────────────┘
                   │ Mongoose ODM         │ ImageKit SDK
┌──────────────────▼───────────┐  ┌───────▼───────────────────┐
│        MongoDB Atlas         │  │      ImageKit CDN         │
│  Collections: users, doctors,│  │  Doctor profile images    │
│  patients, specializations,  │  │  On-the-fly transforms    │
│  hospitals                   │  │  Client-side upload       │
│  Indexes + Soft delete       │  └───────────────────────────┘
└──────────────────────────────┘
```

### Data Flow

1. **Authentication**: User submits login → NextAuth verifies credentials against MongoDB → JWT session token stored in cookie → `proxy.ts` checks cookie on every request to protected routes.

2. **Data Fetching**: React Query hooks call axios instance → hits Next.js Route Handlers → Route Handlers validate auth + input (Zod) → Mongoose queries MongoDB → response flows back through the chain with automatic caching.

3. **State Management**: React Query manages all server state (doctors, patients, stats). Zustand manages client-only state (sidebar open/close, theme preference with localStorage persistence).

4. **Image Upload**: Doctor form uses ImageKit client-side SDK → uploads directly to ImageKit CDN → returns URL → stored in MongoDB as `profileImage` field.

---

## Technical Decisions

### 1. Why Zustand over Redux Toolkit and Context API

**Decision**: Use Zustand for client state management over Redux Toolkit and Context API.

I considered three options for client state: React Context API (built-in), Zustand, and Redux Toolkit.

**Rationale**:
- **Context API re-render issue**: Context API was the simplest option, but it re-renders every consumer whenever any value changes. For a couple of values that's fine, but the spec specifically evaluates "avoid unnecessary re-renders" — so I wanted something more selective.
- **Redux Toolkit is overkill here**: Redux Toolkit is powerful, but this app barely has any client state. React Query already manages all server data (doctors, patients, dashboard stats). The only client-side state is the sidebar toggle and theme preference. Writing slices, reducers, and action creators for two boolean values felt like bringing a sledgehammer to hang a picture frame.
- **Zustand is the sweet spot**: ~1KB bundle, zero boilerplate (a store is literally one function call), and it only re-renders components that actually use the changed value. The `persist` middleware gave me localStorage persistence for the theme in a single line.

|  Context API | Zustand | Redux Toolkit |
|--------------|---------|---------------|
| Bundle ~ 0KB | ~1 KB   | ~11 KB        |

**Trade-off acknowledged**: If the app had complex client workflows (multi-step forms, undo/redo, optimistic updates beyond what React Query handles), I'd reach for Redux Toolkit without hesitation. But for this scale, Zustand keeps things lean.

### 2. Why Next.js Route Handlers over Express.js

**Decision**: Use Next.js 16 built-in Route Handlers instead of a separate Express.js server.

The spec mentions "Express integrated within Next.js architecture." Rather than bolting a separate Express server onto Next.js, I used Next.js 16's built-in Route Handlers — which follow the exact same REST patterns.

**Rationale**:
- **Same patterns, no extra dependency**: Our API routes already do everything Express does — `GET`/`POST`/`PUT`/`DELETE` functions, JSON request/response, auth middleware checks, Zod input validation. The mental model is identical, just without the extra dependency and custom server setup.
- **Avoids complexity**: Adding Express would've meant creating a `server.ts`, losing some Next.js optimizations (streaming, automatic static optimization), and managing two runtimes in one project.
- **Natural fit**: For a full-stack Next.js app where the frontend and API live together, Route Handlers are the natural choice.

**Trade-off acknowledged**: So I don't see any extra advantage of using Express.js. But if this were a microservices architecture or if the backend needed to serve multiple frontends, Express would absolutely be the right call.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16.2.2 | Full-stack React framework with App Router |
| Language | TypeScript 5 | Type safety across client and server |
| Database | MongoDB (Atlas) | Document database with Mongoose ODM |
| Auth | NextAuth.js v5 | JWT-based authentication with credentials provider |
| Styling | Tailwind CSS 4 | Utility-first CSS with shadcn/ui components |
| Data Fetching | TanStack React Query | Server state management with caching |
| Client State | Zustand | Lightweight client state (theme, sidebar) |
| Forms | React Hook Form + Zod | Form handling with schema validation |
| Charts | Recharts | Data visualization (bar, area, pie charts) |
| Image Upload | ImageKit | CDN-hosted doctor profile images with client-side upload |
| HTTP Client | Axios | Centralized API calls with base configuration |
| Icons | Lucide React | Consistent icon set |

---

## Features

- **Authentication**: Secure login with JWT sessions, protected routes via proxy.ts
- **Dashboard**: Analytics cards, top doctors bar chart, monthly trends area chart, condition distribution pie chart, date range filter with presets and calendar picker
- **Doctor Management**: Create, view, search, filter (specialization/hospital), paginate, delete (soft), optional profile image upload
- **Patient Management**: Create, edit, delete (soft), search, filter (condition/doctor), paginate, optional email
- **Doctor Detail**: View doctor info with profile image, manage associated patients
- **Hospital & Specialization Management**: Combined page with tabs, full CRUD for both, searchable lists
- **Searchable Comboboxes**: Server-side search with infinite scroll for specialization, hospital, doctor, and condition selection
- **Inline Creation**: Create new specializations/hospitals directly from the doctor form without leaving the page
- **Dark/Light Theme**: Toggle with system preference detection, persisted via Zustand
- **Responsive Design**: Mobile-first with collapsible sidebar, sheet-based calendar on mobile
- **Soft Delete**: All records use isDeleted flag — no data is permanently lost
- **Query Optimization**: MongoDB text indexes, field indexes, efficient aggregation pipelines
- **Scalability**: Seed script generates 18,500+ records for stress testing

---

## Visual Evidence

> Screenshots to be added after final UI review.

- Dashboard (Desktop & Mobile)
- Doctors list with search/filter
- Doctor detail with patients and profile image
- Patients page with edit dialog
- Hospitals & Specializations management
- Login page
- Dark mode

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Authenticated route group
│   │   ├── layout.tsx       # App shell (sidebar + header)
│   │   ├── dashboard/       # Analytics dashboard with date filters
│   │   ├── doctors/         # Doctor list + [id] detail
│   │   ├── patients/        # Patient list
│   │   └── hospitals/       # Hospital & Specialization CRUD (tabs)
│   ├── api/                 # REST API route handlers
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── imagekit/auth/   # ImageKit upload authentication
│   │   ├── dashboard/stats/ # Aggregated analytics
│   │   ├── doctors/         # Doctor CRUD
│   │   ├── patients/        # Patient CRUD
│   │   ├── conditions/      # Distinct patient conditions
│   │   ├── specializations/ # Specialization CRUD
│   │   └── hospitals/       # Hospital CRUD
│   └── login/               # Login page
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── dashboard/           # Chart components
│   ├── doctors/             # Doctor-specific components
│   ├── patients/            # Patient-specific components
│   ├── hospitals/           # Hospital form
│   ├── combobox-creatable   # Searchable select with inline create
│   ├── combobox-search      # Searchable select (read-only)
│   └── image-upload         # ImageKit upload component
├── hooks/                   # React Query hooks + usePaginatedItems
├── stores/                  # Zustand stores (sidebar, theme)
├── models/                  # Mongoose schemas (User, Doctor, Patient, Hospital, Specialization)
└── lib/                     # Utilities (auth, db, validation, axios)
```
