# 📖 Journova

**Modernizing Scientific Publishing.**

Journova is a modern, modular, and mobile-first platform for academic journal management and publishing. Built as an advanced alternative to traditional systems like OJS, it seamlessly integrates manuscript submissions, peer review, editorial decisions, issue management, and scholarly metadata distribution into a single unified ecosystem.

## 🚀 Features

- **Multi-Journal Architecture:** Manage multiple independent journals under one platform.
- **Distinct Workflows:** Clear separation between `Article` (published content) and `Submission` (editorial process).
- **Advanced Peer Review:** Support for Double Blind and Single Blind peer review assignments.
- **Robust Access Control:** RBAC (Role-Based Access Control) for Admins, Editors, Reviewers, and Authors.
- **Modern UI/UX:** Built with Next.js 16, Tailwind CSS, and shadcn/ui.
- **Scalable Backend:** Powered by NestJS and PostgreSQL via Prisma ORM.

## 🏗️ Architecture (Monorepo)

Journova uses an NPM workspaces monorepo structure:
- `apps/web`: Next.js 16 frontend (App Router)
- `apps/api`: NestJS REST API backend
- `packages/database`: Prisma schema, migrations, and seed scripts

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS, REST API |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **File Storage** | Cloudflare R2 |
| **Deployment** | Vercel (Web & API) |

## 📦 Getting Started

### Prerequisites
- Node.js >= 20
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yogiexc/Journova.git
   cd Journova
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Configure `.env` in `packages/database` with your `DATABASE_URL`.
4. Sync database schema & seed initial data:
   ```bash
   npm run db:push
   npm run db:seed -w database
   ```
5. Start development servers:
   ```bash
   npm run dev:api  # Starts NestJS
   npm run dev:web  # Starts Next.js
   ```

## 📜 License
Internal Project.
