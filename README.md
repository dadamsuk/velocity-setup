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
