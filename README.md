# verse-AI

Verse-AI is a microproject made for fun to overcome the awkwardness of figuring out unique verses for an easter poem. Verse-AI generates a poem and splits its verses between participants. No more hassle!

# Local development

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** >= v22.20.0
- **pnpm** >= 10.32.1
- **Supabase CLI** — see the [installation guide](https://supabase.com/docs/guides/local-development/cli/getting-started)
- **Docker** — required by the Supabase CLI to run local services

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable                | Description                                                                                                                                          | Default                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `PG_CONNECTION_STRING`  | PostgreSQL connection string for local Supabase                                                                                                      | `postgresql://postgres:postgres@localhost:54322/postgres` |
| `SUPABASE_ACCESS_TOKEN` | Supabase personal access token — only needed for remote operations (linking a project, pushing migrations). Not required for local-only development. | —                                                         |

The default `PG_CONNECTION_STRING` in `.env.example` is pre-configured to work with the local Supabase instance out of the box.

## 3. Set up Supabase locally

Log in to the Supabase CLI (required if you plan to interact with a remote project):

```bash
supabase login
```

Start the local Supabase stack (requires Docker):

```bash
pnpm supabase:start
```

This spins up a local PostgreSQL database (port `54322`), REST API (port `54321`), and Supabase Studio (port `54323`).

Apply migrations and seed the database:

```bash
pnpm supabase:reset
```

This runs all migrations from `supabase/migrations/` and seeds the DB with `supabase/seeds/users.sql`. You need to re-run this whenever migrations or seeds change.

## 4.1. Start the Netlify dev server (to run frontend with local backend)

```bash
pnpm netlify:dev
```

This starts the Netlify CLI locally, which serves the Angular app and makes all Netlify Functions available at `/.netlify/functions/<function-name>`. The `.env` file is automatically picked up. No Netlify account login or project linking is required for local development.

## 4.2. Start the Angular frontend (to run frontend with no backend)

In a separate terminal:

```bash
pnpm start
```

## Running everything at once

The following command starts Supabase, resets the DB (migrations + seed), and then launches the Netlify dev server in one go:

```bash
pnpm start:backend
```

Then run `pnpm start` in a separate terminal for the Angular frontend.

**NOTE**: On Windows you might need to run it as administrator because of symlinks.

## Running tests

Backend unit tests hit the local Supabase database. Make sure Supabase is running before executing them:

```bash
pnpm supabase:start   # if not already running
pnpm test:backend
```

End-to-end integration tests run against the live Netlify dev server. Make sure both Supabase and the Netlify dev server are running:

```bash
pnpm supabase:start   # if not already running
pnpm netlify:dev      # in a separate terminal
pnpm test:integration
```

Frontend tests:

```bash
pnpm test
```

## Available scripts

| Script                  | Description                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm start`            | Start the Angular dev server                                                                                                                             |
| `pnpm build`            | Build the Angular app for production                                                                                                                     |
| `pnpm test`             | Run Angular unit tests                                                                                                                                   |
| `pnpm test:backend`     | Run Netlify function unit tests (requires Supabase running)                                                                                              |
| `pnpm test:integration` | Run end-to-end integration tests against the live Netlify dev server (requires both Supabase and Netlify dev servers running - run `pnpm start:backend`) |
| `pnpm start:backend`    | Start Supabase, reset DB, then start Netlify dev                                                                                                         |
| `pnpm netlify:dev`      | Start Netlify dev server only                                                                                                                            |
| `pnpm supabase:start`   | Start the local Supabase stack                                                                                                                           |
| `pnpm supabase:reset`   | Re-apply all migrations and re-seed the database                                                                                                         |
| `pnpm supabase:push`    | Pushes local DB schema migrations to remote                                                                                                              |
| `pnpm supabase:stop`    | Stop the local Supabase stack                                                                                                                            |

## Maintaining Supabase

After a successful local schema migration the changes has to be updated on the remote side as well using the
`pnpm supabase:push` command.
