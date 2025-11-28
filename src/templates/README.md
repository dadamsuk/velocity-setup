# {{projectName}}

A full-stack Next.js application with Supabase, Drizzle ORM, and Shadcn/UI.

## Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js Server Actions
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle
- **Validation:** Zod
- **UI:** Shadcn/UI + Tailwind CSS
- **Testing:** Vitest (unit/integration) + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)

### 1. Start Local Supabase

```bash
# Start the local Supabase stack (requires Docker)
supabase start
```

This will start:
- **API:** http://localhost:54321
- **Database:** postgresql://postgres:postgres@localhost:54322/postgres
- **Studio:** http://localhost:54323
- **Inbucket (email):** http://localhost:54324

### 2. Push Database Schema

```bash
# Push the Drizzle schema to the database
npm run db:push
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

### Supabase

| Command | Description |
|---------|-------------|
| `supabase start` | Start local Supabase stack |
| `supabase stop` | Stop local Supabase stack |
| `supabase status` | Show status of local Supabase |
| `supabase db reset` | Reset database and run migrations/seeds |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit/integration tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   └── ui/              # Shadcn/UI components
│   ├── actions/             # Server Actions
│   ├── db/                  # Database schema and client
│   │   ├── schema.ts        # Drizzle schema
│   │   └── index.ts         # Database client
│   ├── lib/                 # Utilities and helpers
│   │   ├── supabase/        # Supabase client (server/client)
│   │   └── validations/     # Zod schemas
│   └── test/                # Test setup
├── e2e/                     # Playwright E2E tests
├── supabase/                # Supabase configuration
│   ├── config.toml          # Local Supabase config
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Seed data
├── .devcontainer/           # VS Code devcontainer config
└── .vscode/                 # VS Code settings
```

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DATABASE_URL` | PostgreSQL connection string |

For local development, the default values in `.env.local` work with `supabase start`.

## Deployment

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update `.env.local` with your production Supabase credentials
3. Run migrations: `npm run db:migrate`
4. Deploy to Vercel, Netlify, or your preferred platform
