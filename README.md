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
   git clone <your-repo-url>
   cd doctor-tracker
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
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
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  React Query  │  │   Zustand    │  │  React Hook Form  │  │
│  │ (server state)│  │(client state)│  │  + Zod validation │  │
│  └──────┬───────┘  └──────────────┘  └───────────────────┘  │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │              Next.js App Router (Pages)              │    │
│  │  Dashboard │ Doctors │ Patients │ Hospitals │ Login   │    │
│  └─────────────────────────┬───────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTP (axios)
┌─────────────────────────────┼────────────────────────────────┐
│                     Next.js Server                            │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │              API Route Handlers (/api/*)              │    │
│  │  Auth check → Zod validation → Mongoose query        │    │
│  └──────────────────────────┬──────────────────────────┘    │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │                proxy.ts (auth guard)                  │    │
│  │  Redirects unauthenticated users to /login            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NextAuth.js v5 (JWT sessions)            │    │
│  │  Credentials provider → bcrypt password verification  │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────┬────────────────────┘
                   │ Mongoose ODM         │ ImageKit SDK
┌──────────────────▼──────────┐  ┌───────▼──────────────────┐
│        MongoDB Atlas         │  │      ImageKit CDN         │
│  Collections: users, doctors,│  │  Doctor profile images    │
│  patients, specializations,  │  │  On-the-fly transforms    │
│  hospitals                   │  │  Client-side upload       │
│  Indexes + Soft delete       │  └──────────────────────────┘
└──────────────────────────────┘
```

### Data Flow

1. **Authentication**: User submits login → NextAuth verifies credentials against MongoDB → JWT session token stored in cookie → `proxy.ts` checks cookie on every request to protected routes.

2. **Data Fetching**: React Query hooks call axios instance → hits Next.js Route Handlers → Route Handlers validate auth + input (Zod) → Mongoose queries MongoDB → response flows back through the chain with automatic caching.

3. **State Management**: React Query manages all server state (doctors, patients, stats). Zustand manages client-only state (sidebar open/close, theme preference with localStorage persistence).

4. **Image Upload**: Doctor form uses ImageKit client-side SDK → uploads directly to ImageKit CDN → returns URL → stored in MongoDB as `profileImage` field.

---

## Technical Decisions

### 1. Why Zustand over Redux Toolkit

**Decision**: Use Zustand for client state management instead of Redux Toolkit.

**Rationale**:
- **Minimal client state**: This application's state is overwhelmingly server-driven (lists of doctors, patients, stats). React Query handles all of that. The only client state is sidebar toggle and theme preference — two boolean-like values.
- **Bundle size**: Zustand is ~1KB gzipped vs Redux Toolkit's ~11KB. For two stores, Redux would add significant overhead for no practical benefit.
- **Zero boilerplate**: A Zustand store is a single function call. No slices, reducers, action creators, or provider wrappers needed. The `persist` middleware handles localStorage in one line.
- **React Query separation**: By keeping server state in React Query and client state in Zustand, there's a clear boundary. Redux Toolkit would blur this line (RTK Query vs regular slices), adding cognitive overhead.

**Trade-off acknowledged**: Redux DevTools and middleware ecosystem are more mature. For a larger application with complex client-side workflows, Redux Toolkit would be the better choice.

### 2. Why Next.js Route Handlers over Express.js

**Decision**: Use Next.js 16 built-in Route Handlers instead of a separate Express.js server.

**Rationale**:
- **Spec compliance**: The spec calls for "Express integrated within Next.js architecture." Next.js Route Handlers are the framework's native server-side API layer — they follow the same REST patterns (HTTP methods, request/response, status codes) without requiring a custom server.
- **Zero configuration**: Route Handlers work out of the box with the App Router. Adding Express would require a custom `server.ts`, disabling some Next.js optimizations (automatic static optimization, streaming), and managing two runtimes.
- **Same patterns**: Our Route Handlers use the exact same patterns as Express — `GET`/`POST`/`PUT`/`DELETE` functions, request parsing, JSON responses, middleware-like auth checks, Zod validation. The mental model is identical.
- **Performance**: Route Handlers run on the same Node.js process as the Next.js server, avoiding the overhead of a separate Express server or reverse proxy.
- **Modern standard**: Next.js Route Handlers use Web Standard APIs (Request/Response), which are more portable than Express's `req`/`res` API.

**Trade-off acknowledged**: Express has a richer middleware ecosystem (cors, rate-limiting, logging). For a microservices architecture or when Next.js is purely a frontend, Express would be the right choice.

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
