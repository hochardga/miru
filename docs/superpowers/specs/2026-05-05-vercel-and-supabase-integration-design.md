# Vercel And Supabase Integration Design

Date: 2026-05-05
Topic: Miru Vercel and hosted Supabase integration

## Goal

Configure Miru so the existing hosted Supabase setup works correctly across local development, Vercel preview deployments, and Vercel production deployments, with preview environments functioning without manual per-branch URL configuration.

## Inputs And Decisions

This design is based on:

- the current Phase 0 branch state in `/Users/gregoryhochard/Development/miru/.worktrees/phase-0-foundation-and-setup`
- the current runtime env contract in `src/lib/env.ts`
- the current sample env contract in `.env.example`
- Vercel system and framework environment variable documentation
- Supabase redirect URL and SSR auth documentation

Working decisions confirmed during brainstorming:

- Supabase project model: one existing hosted Supabase project shared by production and previews
- Vercel project model: one existing Vercel project named `Miru`
- deployment ownership: repo and config changes only, no dashboard linking from this machine
- preview strategy: previews must function automatically
- production canonical URL: use the Vercel `*.vercel.app` domain for now
- local auth posture: include localhost redirect coverage now so future testing is unblocked

## Problem Statement

The current app requires three public values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

That works for local development, but a single manually managed `NEXT_PUBLIC_APP_URL` is a poor fit for Vercel previews because each preview deployment has its own `*.vercel.app` URL. If Miru later introduces redirect-based auth flows, password reset flows, or any callback-style links, previews will be fragile unless the app can derive its own public origin per deployment and Supabase is configured to allow those preview URLs.

## Product Outcome

After this integration work:

1. local development continues to work with hosted Supabase values
2. preview deployments automatically know their own public URL
3. production automatically knows its canonical public URL
4. Supabase auth URL settings are compatible with local development and preview deployments
5. missing required hosted Supabase values still fail loudly

## Recommended Approach

Use explicit env vars for Supabase project identity and Vercel-derived env vars for public URL resolution.

Why this approach:

- it keeps Supabase project identity stable across all environments
- it removes manual per-preview URL configuration
- it preserves an explicit override path when needed
- it matches how Vercel exposes framework-prefixed public env values for Next.js deployments
- it keeps the repo ready for future redirect-based auth without overbuilding the Phase 0 runtime

## Runtime Configuration Contract

### Required values

The runtime should continue to require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These come from the single hosted Supabase project and should be configured explicitly in Vercel for `Production`, `Preview`, and local development.

### Optional manual override

`NEXT_PUBLIC_APP_URL` should become optional.

If provided, it remains the highest-priority override. This supports rare cases where deployment URL inference must be bypassed intentionally.

### Derived public URL

Introduce one canonical site-origin resolver used anywhere the app needs to know its own public URL.

Resolution order:

1. `NEXT_PUBLIC_APP_URL` when explicitly set
2. `https://${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` when running in Vercel production
3. `https://${NEXT_PUBLIC_VERCEL_BRANCH_URL}` when running in Vercel preview and branch URL is present
4. `https://${NEXT_PUBLIC_VERCEL_URL}` when running in Vercel preview and only deployment URL is present
5. `http://localhost:3000` for local development fallback

Normalization rules:

- ensure protocol is present
- ensure no accidental trailing-whitespace or malformed host values
- return a stable origin form suitable for redirects and callback generation

### Failure behavior

The app must still fail fast when either hosted Supabase value is missing or invalid.

The app should not fail simply because `NEXT_PUBLIC_APP_URL` is unset if a correct Vercel- or localhost-derived URL can be produced.

## Code Boundaries

### Environment validation

`src/lib/env.ts` should keep responsibility for parsing required public Supabase values.

It should stop treating `NEXT_PUBLIC_APP_URL` as universally required and instead expose only the values that truly must be configured directly.

### Site URL helper

Add a small dedicated helper for resolving the current site origin.

This helper should:

- read the validated required env values where relevant
- inspect Vercel public system env values when present
- expose one normalized URL or origin result
- be the only place in the app that knows the precedence rules

This keeps future auth callback flows from scattering environment logic across multiple files.

### Docs and examples

`.env.example` should describe:

- `NEXT_PUBLIC_SUPABASE_URL` as required
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` as required
- `NEXT_PUBLIC_APP_URL` as optional override
- `SUPABASE_SERVICE_ROLE_KEY` as server-only and not part of the Phase 0 runtime

Repo docs should also explain that preview correctness depends on Vercel system env exposure being enabled in the dashboard.

## Vercel Configuration Contract

The repo should assume the existing Vercel project has:

- `NEXT_PUBLIC_SUPABASE_URL` configured for `Production`, `Preview`, and `Development`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured for `Production`, `Preview`, and `Development`
- optional `NEXT_PUBLIC_APP_URL` only if a manual override is desired
- `Automatically expose System Environment Variables` enabled

This last setting is important because Vercel documents that framework-prefixed values such as `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_BRANCH_URL`, and `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` are supplied from system env exposure for Next.js deployments.

## Supabase Configuration Contract

Because previews and production share one hosted Supabase project, Supabase Auth URL settings must allow both the production Vercel domain and preview Vercel domains.

Target dashboard configuration:

- `SITE_URL` set to Miru's canonical production `https://*.vercel.app` URL
- Redirect URLs include `http://localhost:3000/**`
- Redirect URLs include the Vercel preview wildcard for the Miru project owner, in the form `https://*-owner-slug.vercel.app/**`

Purpose of each entry:

- `SITE_URL` defines the default production redirect target
- `http://localhost:3000/**` keeps local redirect-based auth testing viable
- the Vercel preview wildcard allows preview deployment callbacks without per-branch manual entry

Anonymous auth today does not depend on these redirect URLs, but future OAuth, magic link, email confirmation, or password reset flows will.

## Testing And Verification Strategy

### Automated verification

Add unit coverage for the site-origin resolver that proves:

- explicit override wins when `NEXT_PUBLIC_APP_URL` is set
- production resolves from `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`
- preview resolves from `NEXT_PUBLIC_VERCEL_BRANCH_URL` when available
- preview falls back to `NEXT_PUBLIC_VERCEL_URL` when needed
- local development falls back to `http://localhost:3000`
- malformed or missing hosted Supabase values still fail loudly in env validation

### Local verification

Verify that:

- `npm test` passes with the new env resolution logic
- `npm run lint` passes
- `npm run typecheck` passes

If local smoke coverage touches site-origin logic, it should continue to work without requiring Vercel linkage on this machine.

### Dashboard verification checklist

Document a human checklist for the user to apply in Vercel and Supabase:

1. confirm `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel for `Production`, `Preview`, and `Development`
2. confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel for `Production`, `Preview`, and `Development`
3. confirm `Automatically expose System Environment Variables` is enabled in Vercel
4. confirm Supabase `SITE_URL` is the production `*.vercel.app` URL
5. confirm Supabase redirect URLs include localhost and the Vercel preview wildcard

## Out Of Scope

This integration does not include:

- linking the local checkout to Vercel from this machine
- changing the app to use a separate staging Supabase project
- implementing OAuth, magic-link, email confirmation, or password reset UI
- introducing server-only admin runtime usage

## Risks And Mitigations

### Risk: Vercel system env exposure is disabled

Impact:

- preview deployments may not receive the public Vercel URL values the resolver expects

Mitigation:

- document this explicitly in repo guidance
- keep `NEXT_PUBLIC_APP_URL` as an optional manual override escape hatch

### Risk: Supabase preview wildcard uses the wrong team or account slug

Impact:

- preview callback URLs will be rejected by Supabase Auth

Mitigation:

- document the exact wildcard pattern the user must set in the Supabase dashboard

### Risk: production and preview share the same auth backend

Impact:

- preview activity and production activity share one Supabase project

Mitigation:

- accept this intentionally for now because it matches the chosen operating model
- keep the env and URL logic isolated so a separate staging backend can be introduced later without undoing the whole design

## Acceptance Criteria

This design is complete when:

- the repo derives public app URLs correctly for local, preview, and production contexts
- preview deployments no longer depend on a manually rotated `NEXT_PUBLIC_APP_URL`
- hosted Supabase configuration remains explicit and validated
- repo docs explain the exact Vercel and Supabase settings needed for preview-safe auth behavior
- automated tests cover the new environment precedence rules
