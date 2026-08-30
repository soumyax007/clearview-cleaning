# Clearview Cleaning Co.

Marketing site for a residential and commercial cleaning company with a working MongoDB-backed quote request form.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/clearview-cleaning run dev` — run the public website
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `MONGODB_URI` — MongoDB connection string for saving quote requests

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: MongoDB + Mongoose for quote requests
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/clearview-cleaning/src/` — public marketing site and quote form
- `artifacts/api-server/src/routes/quotes.ts` — quote request REST endpoints
- `artifacts/api-server/src/lib/mongodb.ts` — MongoDB connection and quote model
- `lib/api-spec/openapi.yaml` — source of truth for the API contract

## Architecture decisions

- Residential and commercial copy is shared state so the selected audience stays synchronized across the page.
- Quote requests use the requested MongoDB/Mongoose stack and require `MONGODB_URI` at runtime.
- The public site uses generated React Query hooks from the OpenAPI contract for quote submission.

## Product

- Single-page marketing experience with audience-aware messaging
- Service information, trust signals, process, testimonials, FAQ accordion, and click-to-call contact
- Quote request form that persists submissions to MongoDB

## User preferences

- Keep the brand name and placeholder business figures easy to replace later.

## Gotchas

- Add `MONGODB_URI` before testing quote submission; the API reports a clear error when it is missing or unreachable.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
