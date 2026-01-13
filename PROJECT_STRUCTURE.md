# Project Structure

Clean and organized directory structure for AgentKit-Pro.

## Root Structure

```
AgentKit-Pro/
├── .claude/              # Claude Code configuration
├── .git/                # Git repository
├── .serena/             # Serena LSP cache
├── .trae/               # Trae IDE configuration
├── api/                 # Vercel Serverless Functions
│   ├── download.js
│   ├── github-api.js
│   ├── preview.js
│   └── skills/
│       └── ai-search.js
├── components/          # React components
│   ├── CategorySelector.tsx
│   └── Layout.tsx
├── dist/                # Build output
├── Docs/                # Project documentation
├── hooks/               # Custom React hooks
│   └── useHashRouter.ts
├── node_modules/        # NPM dependencies
├── pages/               # React page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── SearchPage.tsx
├── public/              # Static assets
│   └── assets/
├── scripts/             # Utility scripts
│   ├── dev/
│   │   └── check_api.js
│   └── README.md
├── services/            # API services and business logic
│   ├── authService.ts
│   ├── categoriesService.ts
│   ├── skillsService.ts
│   ├── skillsmpService.ts
│   └── supabaseClient.ts
├── supabase/            # Database migrations and functions
│   ├── .temp/           # CLI temp files (DO NOT MODIFY)
│   ├── dev/             # Development utilities
│   │   ├── dev_policy.sql
│   │   └── insert_dev_user.sql
│   ├── docs/            # Database documentation
│   ├── functions/       # Edge Functions
│   │   └── skillsmp-proxy/
│   │       └── index.ts
│   ├── migrations/      # Database migrations (ordered by date)
│   │   ├── 20241201_initial_schema.sql
│   │   ├── 20241202_skills_tables.sql
│   │   ├── 20241205_schema_fixes.sql
│   │   ├── 20241210_schema_fixes_v2.sql
│   │   ├── 20241211_policies_update.sql
│   │   ├── 20250113_create_categories_table.sql
│   │   └── 20250113_add_category_functions.sql
│   ├── migrations/      # (continued)
│   │   ├── create_avatars_bucket.sql
│   │   ├── dev_mock_policy.sql
│   │   └── skills_zip_tree.sql
│   └── README.md
├── .env                 # Environment variables (local)
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── AGENTS.md            # Project context & agent instructions
├── App.tsx              # Main application component
├── index.html           # HTML entry point
├── index.tsx            # Application entry point
├── metadata.json        # Project metadata
├── package.json         # NPM dependencies
├── package-lock.json    # NPM lock file
├── README.md            # Project documentation
├── skillsmp-proxy.js    # Local proxy for SkillsMP API (dev only)
├── tsconfig.json        # TypeScript configuration
├── types.ts             # TypeScript type definitions
├── vite-env.d.ts        # Vite type declarations
└── vite.config.ts       # Vite build configuration
```

## Key Directories Explained

### `/api` - Vercel Serverless Functions
API endpoints for production deployment on Vercel.

### `/components` - React Components
Reusable UI components used across the application.

### `/hooks` - Custom React Hooks
Custom hooks like `useHashRouter` for routing.

### `/pages` - Page Components
Main application pages (Dashboard, Search, Login, etc.).

### `/scripts` - Utility Scripts
Development and maintenance scripts.

### `/services` - Business Logic
API clients, Supabase services, and business logic.

### `/supabase` - Database Layer
- **`migrations/`**: All database schema changes
- **`dev/`**: Development-only policies and utilities
- **`functions/`**: Supabase Edge Functions
- **`docs/`**: Database documentation

## File Naming Conventions

- **Components**: PascalCase (e.g., `CategorySelector.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useHashRouter.ts`)
- **Services**: camelCase (e.g., `categoriesService.ts`)
- **Migrations**: `YYYYMMDD_descriptive_name.sql`

## Development Workflow

### Local Development
1. Start the proxy: `node skillsmp-proxy.js` (port 3001)
2. Start the dev server: `npm run dev` (port 8080)

### Database Changes
1. Create new migration: `supabase/migrations/YYYYMMDD_description.sql`
2. Apply locally: `supabase db push`
3. Test thoroughly
4. Commit the migration file

### Adding New Features
1. Create component in `/components` or `/pages`
2. Create service in `/services` if needed
3. Add types to `/types.ts`
4. Update `AGENTS.md` if architectural changes

## Important Notes

- ✅ **All migrations are now organized** in `supabase/migrations/`
- ✅ **Dev utilities** are in `supabase/dev/`
- ✅ **Scripts** are in `scripts/dev/`
- ✅ **No loose SQL files** in root directory
- ✅ **Clean separation** between production and development code

## Cleanup Summary

### Files Moved
- `dev_policy.sql` → `supabase/dev/`
- `insert_dev_user.sql` → `supabase/dev/`
- `check_api.js` → `scripts/dev/`
- `supabase_schema.sql` → `supabase/migrations/20241201_initial_schema.sql`
- `create_skill_files.sql` → `supabase/migrations/20241202_skills_tables.sql`
- `fix_schema.sql` → `supabase/migrations/20241205_schema_fixes.sql`
- `fix_schema_v2.sql` → `supabase/migrations/20241210_schema_fixes_v2.sql`
- `policies_update.sql` → `supabase/migrations/20241211_policies_update.sql`

### New Files Created
- `supabase/README.md` - Database documentation
- `supabase/docs/README.md` - Additional DB docs
- `scripts/README.md` - Scripts documentation
- `PROJECT_STRUCTURE.md` - This file
