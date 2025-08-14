# Three sync engines, one kanban.

This project demonstrates three sync engines (Zero, Electric, and PowerSync) and three UIs running live against the same Postgres.

This was demo'd live on stage at React Miami 2025:

[https://www.youtube.com/watch?v=SNAHZZo21To](https://www.youtube.com/watch?v=SNAHZZo21To&t=1707s)

## Setup

Copy .env.example to .env and populate:

- DATABASE_URL: Your Postgres connection string. Cannot be a connection pooler.
- ZERO_UPSTREAM_DB: Same as above
- VITE_POWERSYNC_URL: URL to your deployed Powersync node, from Powersync dashboard.
- VITE_SUPABASE_ANON_KEY: Anon key from Supabase API dashboard.
- VITE_SUPABASE_URL: Supabase API URL.
- VITE_ZERO_SERVER: URL to zero-cache.
- VITE_ELECTRIC_SHAPE_URL: URL to Electric shape stream, from Electric dashboard.

## Run

In one tab:

```
npx zero-cache-dev
```

In a separate tab:

```
npm run dev
```

## TODO

- Correctly populate creatorID
- Implement write permissions
- Implement server side of Powersync
