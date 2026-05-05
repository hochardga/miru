# Phase 0 Foundation And Setup Design

Date: 2026-05-04
Topic: Miru Digital Phase 0 foundation and setup

## Goal

Deliver a running mobile-first Next.js app shell with real Supabase auth/session plumbing, approved design tokens, database migrations, and a test harness. Phase 0 should already feel like a credible product slice, not a starter template with disconnected infrastructure.

## Inputs And Decisions

This design is based on:

- `docs/product-roadmap.md` Phase 0
- `docs/prd.md` sections `Technical Architecture`, `Data Model`, `Design System`, `Auth Implementation`, and `Dependencies & Integrations`
- `docs/product-vision.md` section `Design Direction`, especially `Color Palette`, `Typography`, and `Design Tokens`
- `docs/gtm.md` section `Budget Considerations`

Working decisions confirmed during brainstorming:

- Environment baseline: `hosted-dev-first`
- UX bar: `polish-leaning`
- Delivery style: `experience-first vertical slice`

## Product Outcome

The Phase 0 experience should prove one honest user journey:

1. A user lands on `/` and sees a polished mobile-first Miru shell.
2. The user starts or resumes from the home screen through a real anonymous Supabase session.
3. The app routes into a believable interior shell with protected pages and calm empty/loading/error states.
4. The database contract, RLS policies, and tests already exist so Phase 1 can build on a stable foundation.

This phase may create a placeholder run record and route into `/play/[runId]`, but it must not introduce turn logic, rules resolution, or fake gameplay depth.

## Architecture

Phase 0 should remain a single Next.js App Router app with a thin split between presentation, session plumbing, and persistence.

Primary boundaries:

- `src/app/*`: route composition, metadata, route handlers, and top-level protected pages
- `src/components/ui/*`: reusable design-system primitives
- `src/components/features/auth/*`: anonymous session and launch UX
- `src/lib/supabase/*`: browser, server, and middleware client helpers plus environment validation
- `src/lib/validation/*`: shared `zod` schemas and payload guards
- `supabase/migrations/*`: schema and RLS contract

Rules for those boundaries:

- Route files compose screens and call server entrypoints; they do not hold shared design-system logic.
- Design-system primitives own touch targets, token usage, and variant rules so later feature work inherits consistent behavior.
- Supabase helpers centralize environment access and auth-aware client creation.
- The runtime must use authenticated user context for normal app behavior. No service-role access belongs in browser code or general request handling.

## Shell And Route Contract

### Home route

`/` is both the product landing page and the first proof that the design system is real. It should include:

- Miru identity and field-kit tone
- A primary `Start Run` action
- One or two secondary actions that remain consistent with the protected-route model
- Real compositions of `Button`, `IconButton`, and `Panel`
- Friendly loading and retry states for anonymous auth

The key design rule is that home should feel intentional enough to stand as the app’s first real screen, not as a temporary launch pad.

### Protected routes

`/play/[runId]`, `/runs`, `/rules`, and `/settings` remain protected routes in Phase 0, matching the PRD auth model. If a home-screen secondary action targets one of those routes, it must flow through the same anonymous-session gate before navigation rather than bypassing auth.

Protected-route behavior:

- Unauthenticated users are redirected to `/` with a friendly explanation
- Authenticated users reach a consistent interior shell
- Missing or unavailable data shows quiet, explicit empty states rather than framework defaults

### Interior shells

All interior routes should share the same structural rhythm even if extraction into a shared shell component happens during implementation:

- page heading
- lightweight route context
- primary workspace region
- route-specific placeholder or empty content
- consistent action area and navigation affordances

`/play/[runId]` gets the strongest structure because it is the first destination after run bootstrap. `/runs`, `/rules`, and `/settings` should feel deliberate but shallow.

## Design System Contract

Phase 0 should establish a small opinionated primitive layer instead of waiting for Phase 1.

Required primitives:

- `Button`
- `IconButton`
- `Panel`
- `Modal`
- `cn` utility for class composition

These primitives should encode the PRD rules directly:

- 44px minimum touch targets
- restrained radius scale: 4px, 6px, 8px
- parchment, ink, and signal tokens from the approved palette
- low-noise hierarchy driven by borders and surface contrast rather than heavy shadow

Font handling should use Next.js font loading with CSS variables that map cleanly onto the PRD token names:

- `--font-heading`: Fraunces
- `--font-body`: Inter
- `--font-mono`: IBM Plex Mono

This keeps the design-token contract intact while using the platform-native font-loading path rather than CSS `@import`.

## Session And Data Flow

Phase 0 should prove real Supabase auth without dragging in Phase 1 gameplay logic.

### Anonymous session flow

1. The home screen uses a browser Supabase client to check for an existing session.
2. If a protected action is triggered without a session, the client creates or restores an anonymous session with `signInAnonymously()`.
3. `Start Run` then calls a small server bootstrap endpoint that:
   - validates the request
   - reads the authenticated user from the request context
   - upserts the `profiles` row
   - reuses an existing active placeholder run when appropriate or creates a minimal new one
   - returns the target run identifier for `/play/[runId]`
4. Non-run protected actions such as opening `/rules` or `/settings` use the same session gate, then navigate once session state is confirmed.

This preserves one clean rule: session creation happens once, then route-specific actions decide whether they also need server-side bootstrap work.

### Middleware and server responsibility

Middleware is responsible for:

- syncing auth state for SSR
- protecting `/play/*`, `/runs`, `/rules`, and `/settings`
- redirecting unauthenticated requests back to `/`

Server-side bootstrap logic is responsible for:

- trusting only authenticated session context
- writing profile and run bootstrap data
- never relying on browser-supplied ownership fields

Browser code is responsible for:

- action pending state
- human-readable loading and retry copy
- navigation after successful bootstrap

## Database And RLS Contract

The schema and RLS shape from the PRD should be created in Phase 0 even if several tables are only lightly exercised at first. This stabilizes the contract for later phases and keeps the hosted Supabase setup honest.

Required database outcomes:

- initial schema migration for the PRD entities, types, constraints, relationships, and indexes
- second migration for RLS enablement and owner-scoped policies
- every user-owned public table protected with `auth.uid() = user_id` style policies
- unauthenticated requests blocked from reading user-owned data

Phase 0 should not weaken the schema just because the UI is still shallow. The goal is a credible shell on top of a stable contract, not a temporary database that must be replaced in Phase 1.

## Environment And Hosting Contract

Hosted Supabase development is the default operating mode for this phase.

Runtime expectations:

- the app should work cleanly against a shared hosted development Supabase project
- local Supabase CLI support is allowed, but it is not the primary setup path
- Vercel remains the intended preview/hosting target, though deployment is not required to complete the design itself

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

`SUPABASE_SERVICE_ROLE_KEY` may be documented for future admin scripts or maintenance tasks, but the Phase 0 runtime should not require it for normal app behavior. If it appears in `.env.example`, it should be clearly marked as server-only and non-runtime.

Missing required runtime variables must fail fast with clear developer-facing errors.

## Testing And Verification Strategy

Phase 0 tests should prove the vertical slice, not just the presence of tools.

### Unit and component smoke coverage

Keep initial unit coverage intentionally small but real:

- one UI primitive smoke test
- one validation or utility smoke test

The point is to prove the harness, not to simulate future gameplay logic.

### End-to-end coverage

Playwright should cover the home-shell slice:

- the home page renders successfully
- the primary action is present and visible
- protected-route behavior is predictable for unauthenticated users

Because the baseline is `hosted-dev-first`, Playwright should support a default smoke mode that does not require fragile shared-environment choreography. If Supabase-backed flows are enabled in CI or local runs, they should be guarded behind explicit environment availability.

## Error-Handling Contract

Phase 0 should prefer calm, human-readable failure states from day one.

Required unhappy-path behavior:

- missing environment variables show clear developer errors
- anonymous auth failure shows retry guidance on `/`
- protected routes redirect gently instead of exposing raw auth failures
- route shells include loading and empty states, while auth failures are handled through redirect or inline explanation
- no screen should collapse into unstyled framework fallback content

## Recommended Interpretation Of The Roadmap Tasks

The Phase 0 task list remains the scope anchor, but implementation should follow the vertical slice rather than the checklist order alone.

Recommended execution shape:

1. scaffold the app and install the core dependencies
2. implement global tokens, fonts, and Tailwind theme
3. build the UI primitives and home-shell composition
4. add Supabase browser/server/middleware helpers and protected-route behavior
5. add route shells and the anonymous session gate
6. create schema and RLS migrations
7. finish the test harness around the approved shell behavior

This still satisfies the roadmap goal while keeping the work centered on one believable user journey.

## Explicitly Out Of Scope

Phase 0 must not absorb Phase 1 work.

Out of scope:

- turn engine logic
- rules resolution
- combat, survival, camp, or map mechanics
- rich run history
- full rules search experience
- production-grade admin tooling

## Exit Criteria

Phase 0 is complete when all of the following are true:

- `npm run dev` starts a working Next.js shell
- the home page reflects the approved Miru field-kit tone
- design tokens and primitives are real and reused
- protected interior route shells exist and feel intentional
- anonymous Supabase session plumbing works against the hosted dev project
- schema and RLS migrations establish the Phase 1 database contract
- the test harness runs meaningful smoke coverage for the shell

At that point, the project is ready for a detailed implementation plan and then for Phase 1 engine work without revisiting the app foundation.
