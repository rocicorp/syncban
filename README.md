# Syncban

Three sync engines, one kanban.

## Setup

Copy .env.example to .env and populate:

- DATABASE_URL: Your Postgres connection string. Cannot be a connection pooler.
- VITE_POWERSYNC_URL: URL to your deployed Powersync node, from Powersync dashboard.
- VITE_SUPABASE_URL: Supabase API URL.
- VITE_SUPABASE_ANON_KEY: Anon key from Supabase API dashboard.
- VITE_ZERO_SERVER: URL to zero-cache.
- VITE_ELECTRIC_SHAPE_URL: URL to Electric shape stream, from Electric dashboard.

## Run

```
npm run dev
```
