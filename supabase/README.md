# Supabase Database Structure

This folder contains all database-related configurations, migrations, and development utilities.

## Folder Structure

```
supabase/
├── migrations/           # Database migrations (applied in order)
│   ├── YYYYMMDD_description.sql
│   └── ...
├── dev/                 # Development-only utilities
│   ├── dev_policy.sql   # Permissive policies for local development
│   └── insert_dev_user.sql
├── functions/           # Supabase Edge Functions
│   └── skillsmp-proxy/
├── docs/                # Database documentation
│   └── README.md
└── .temp/              # CLI temporary files (do not modify)
```

## Migrations

Migrations are SQL files that are applied sequentially to the database. They follow the naming convention:

```
YYYYMMDD_descriptive_name.sql
```

### Existing Migrations

1. `20241201_initial_schema.sql` - Initial schema with profiles table
2. `20241202_skills_table.sql` - Skills table creation
3. `20241203_skill_files_table.sql` - Skill files and ZIP support
4. `20241204_storage_bucket.sql` - Skills storage bucket
5. `20241205_fixes.sql` - Schema fixes and user_id addition
6. `20241210_fixes_v2.sql` - Additional schema fixes
7. `20241211_policies_update.sql` - RLS policies update
8. `20250113_create_categories_table.sql` - Categories system
9. `20250113_add_category_functions.sql` - Category management functions

## Development Utilities

The `dev/` folder contains utilities for local development only:

- **dev_policy.sql**: Applies permissive RLS policies for local/mock development
- **insert_dev_user.sql**: Creates a test user for local development

To apply dev policies:
```sql
-- Execute in Supabase SQL Editor
\i supabase/dev/dev_policy.sql
```

## Applying Migrations

### Via Supabase CLI
```bash
supabase db push
```

### Via SQL Editor
Copy and run migrations in order from the Supabase Dashboard SQL Editor.

## Important Notes

- **Never modify** applied migrations directly
- **Always create new migrations** for schema changes
- **Test migrations locally** before applying to production
- **Backup before** applying destructive changes

## Schema Overview

### Main Tables
- `profiles` - User profiles (linked to auth.users)
- `skills` - AI skills catalog
- `skill_files` - Individual files within skill ZIPs
- `categories` - Skill categorization (predefined + custom)

### Storage
- `skills` bucket - Stores ZIP files for each skill

### RLS Policies
- Production: User-isolated policies
- Development: Permissive policies (see dev/dev_policy.sql)
