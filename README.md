# Velocity Setup

A CLI tool that scaffolds full-stack Next.js applications with a modern, opinionated tech stack.

## What It Creates

Running `velocity` generates a production-ready Next.js project with:

- **Next.js 16** with App Router and TypeScript
- **Supabase** for database and authentication
- **Drizzle ORM** for type-safe database access
- **Shadcn/UI** + Tailwind CSS for styling
- **Vitest** for unit/integration testing
- **Playwright** for end-to-end testing
- **DevContainer** configuration for VS Code
- **Prettier** + ESLint for code formatting

## Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- [GitHub CLI](https://cli.github.com/) (`gh`) - authenticated

## Installation

```bash
# Clone the repo
git clone https://github.com/dadamsuk/velocity-setup.git
cd velocity-setup

# Install dependencies
npm install

# Build the CLI
npm run build
```

## Configuration

Create a `.env` file with your Supabase organization ID:

```bash
SUPABASE_ORG_ID=your-org-id
```

You can find your org ID in the Supabase dashboard URL or via `supabase orgs list`.

## Usage

### Quick Start (Default Mode)

```bash
npm start
# or
node dist/index.js
```

This will:
1. Prompt for a project name
2. Prompt for a database password
3. Create a new Supabase project in your org (eu-west-1 region)
4. Scaffold the full application
5. Initialize git and push to a new private GitHub repo

### Manual Mode

For more control over Supabase configuration:

```bash
npm start -- --supabase
```

This allows you to:
- Link to an existing Supabase project
- Choose a different region
- Skip Supabase setup entirely

### Skip Docker Files

If you're only deploying to Vercel and don't need Docker/Coolify support:

```bash
npm start -- --no-docker
```

### Destroy a Project

To completely remove a project and its associated resources:

```bash
npm start destroy my-app
# or just
npm start destroy
# (will prompt for project name)
```

This will:
1. Ask for confirmation (you must type the project name)
2. Let you select what to delete:
   - GitHub repository (`velocity-<project-name>`)
   - Supabase project (local containers and data)
   - Docker resources (containers, volumes, networks)
3. Delete the project directory

## What Gets Generated

```
your-project/
├── .devcontainer/       # VS Code devcontainer config
├── .vscode/             # VS Code settings & extensions
├── e2e/                 # Playwright e2e tests
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/ui/   # Shadcn/UI components
│   ├── db/              # Drizzle schema & client
│   ├── lib/supabase/    # Supabase client helpers
│   └── test/            # Vitest setup
├── supabase/            # Supabase local config
├── Dockerfile           # Production Docker build
├── docker-compose.yml   # Docker Compose with Redis
├── vercel.json          # Vercel configuration
├── drizzle.config.ts    # Drizzle configuration
├── vitest.config.ts     # Vitest configuration
├── playwright.config.ts # Playwright configuration
└── ...
```

## Available Scripts (in generated project)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run Vitest tests |
| `npm run test:e2e` | Run Playwright tests |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run format` | Format code with Prettier |

## Deployment

Generated projects are ready to deploy to **Vercel** or **Coolify** (self-hosted).

### Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `REDIS_URL` (use [Upstash](https://upstash.com) for serverless Redis)

### Coolify (Self-hosted)

1. Create a new service in Coolify using Docker Compose
2. Point it to your repository
3. Create `.env.production` with your production environment variables
4. Deploy

The included `docker-compose.yml` runs your app with Redis. For Supabase:
- **Supabase Cloud**: Point env vars to your cloud project
- **Self-hosted Supabase**: Deploy Supabase separately via Coolify's template, then point env vars to it

## Reference Application

The `reference/` folder contains a complete example application - a simple notes app demonstrating:

- Server Actions for CRUD operations
- Drizzle ORM with Supabase
- Zod validation
- Shadcn/UI components

To run the reference app:

```bash
cd reference
supabase start
npm run db:push
npm run dev
```

## Development

```bash
# Run the CLI in development mode
npm run dev

# Build
npm run build
```

## License

Commercial and private.  

(C) DSC 2025
