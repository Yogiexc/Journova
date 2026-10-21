# 📖 Journova

<p align="center">
  <img src="https://raw.githubusercontent.com/Yogiexc/Journova/main/apps/web/public/logo.png" width="220" alt="Journova Logo" />
</p>

<h3 align="center">Modernizing Scientific Publishing & Academic Journal Management</h3>

<p align="center">
  A state-of-the-art, high-performance, and responsive open-access journal publishing platform built with Next.js, NestJS, Prisma, and PostgreSQL. Designed as a modern alternative to Open Journal Systems (OJS).
</p>

<p align="center">
  <a href="https://journova-web.vercel.app"><strong>Explore Live Demo »</strong></a>
  <br />
  <a href="https://journova-api-production.up.railway.app/api/docs">API Documentation (Swagger)</a>
  ·
  <a href="https://github.com/Yogiexc/Journova/issues">Report Bug</a>
  ·
  <a href="https://github.com/Yogiexc/Journova/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.10-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-00E599?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?logo=cloudflare" alt="Cloudflare R2" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL | Status |
|---|---|---|---|
| **Web Frontend** | Vercel | [journova-web.vercel.app](https://journova-web.vercel.app) | ![Vercel](https://img.shields.io/badge/Vercel-Live-success?logo=vercel) |
| **REST API Server** | Railway | [journova-api-production.up.railway.app](https://journova-api-production.up.railway.app/api/docs) | ![Railway](https://img.shields.io/badge/Railway-Live-success?logo=railway) |
| **Database** | Neon Cloud | Serverless PostgreSQL (us-east-2) | ![Neon](https://img.shields.io/badge/Neon-Connected-success?logo=postgresql) |

---

## ✨ Key Features

- **Multi-Role Academic Workflow:** Specialized dashboards for **Author**, **Editor**, **Reviewer**, and **Super Admin**.
- **End-to-End Peer Review:** Single-blind and double-blind peer review assignments, reviewer scoring, and editorial recommendations.
- **Publication & Issue Management:** Group articles into Volumes and Issues with scheduled digital publication.
- **Cloudflare R2 Dual-Provider Storage:** Secure file storage with path-traversal protection and dynamic streaming downloads for manuscripts and published PDFs.
- **Crossref DOI Integration:** Schema 4.4.2 XML metadata generation and automated HTTPS POST deposit with tracking states (`PENDING`, `SUBMITTED`, `SUCCESS`, `FAILED`).
- **Comprehensive API & Security:** JWT Access & Refresh token rotation, Argon2 password hashing, strict production CORS allowlists, Rate Limiting (Throttler), and Helmet CSP headers.
- **Modern Scholarly SEO:** Dynamic XML Sitemap generator (`/sitemap.xml`), robots.txt, Canonical URLs, Schema.org `ScholarlyArticle` JSON-LD, and OpenGraph tags.

---

## 🔐 Default Demo Accounts

All demo accounts use the standard password: **`Password123!`**

| Role | Email | Capabilities |
|---|---|---|
| **Super Admin** | `admin@journova.com` | Complete system management, user role control, journal settings |
| **Editor** | `editor@test.com` | Submission triage, reviewer assignment, issue publication, DOI deposit |
| **Reviewer** | `reviewer@test.com` | Review assigned manuscripts, submit scores & review remarks |
| **Author** | `author@test.com` | Submit new manuscripts, track revisions, download proof copies |

---

## 🏗️ Project Architecture (Monorepo)

```text
journova/
├── apps/
│   ├── api/             # NestJS REST API Server
│   │   ├── src/
│   │   │   ├── auth/          # JWT & Argon2 Authentication & RBAC Guards
│   │   │   ├── articles/      # Article querying & public metadata
│   │   │   ├── submissions/   # Author manuscript submission workflow
│   │   │   ├── reviews/       # Peer review assignments & feedback
│   │   │   ├── issues/        # Volumes, Issues, & Issue Publication
│   │   │   ├── storage/       # Dual-provider Storage (Local & Cloudflare R2)
│   │   │   └── doi/           # Crossref v4.4.2 XML Builder & HTTPS Deposit
│   └── web/             # Next.js 14 Web Application (App Router)
│       └── src/
│           ├── app/(public)/   # Landing page, archive, issue, & article reader
│           ├── app/(auth)/     # Sign in & Sign up flows
│           └── app/(dashboard)/# Role-based dashboards (Author, Editor, Reviewer)
├── packages/
│   └── database/        # Prisma Schema, Migrations, & Production Seed Script
└── .github/workflows/   # CI/CD Automated Build & Test Pipeline
```

---

## 🛠️ Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/Yogiexc/Journova.git
cd Journova
npm install
```

### 2. Configure Environment
Copy `.env.example` to your environment files:
```bash
cp .env.example .env
```
Ensure your PostgreSQL connection string is set in `DATABASE_URL`.

### 3. Database Migration & Seed
```bash
npm run db:push
npm run seed -w api
```

### 4. Run Development Servers
```bash
npm run dev:api   # Runs NestJS on http://localhost:3001
npm run dev:web   # Runs Next.js on http://localhost:3000
```

---

## 🧪 Testing & Code Quality

```bash
# Run Core Test Suite (Storage Resolver, Path Traversal, Crossref, & Env Validation)
npm run test

# Run Typecheck & Production Build
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
