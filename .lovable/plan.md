

# Plan: Build Edge Functions for Live Data

## Overview

Create 3 edge functions to replace mock data with live APIs, plus a frontend API layer and data-fetching hooks. The dashboard will load live data on mount, falling back to mock data if APIs fail.

## Architecture

```text
Frontend (React)
  └─ useDestinations(mode) hook (react-query)
       └─ supabase.functions.invoke('fetch-destinations', { mode, days })
            ├─ fetch-flights  → Amadeus Flight Offers Search v2
            ├─ fetch-weather  → Stormglass /v2/weather/point
            └─ fetch-sentiment → Firecrawl search (scrape ski/surf forums)
```

## Edge Functions

### 1. `fetch-flights` — Amadeus
- OAuth2 token exchange: POST `https://test.api.amadeus.com/v1/security/oauth2/token` with `AMADEUS_API_KEY` + `AMADEUS_API_SECRET`
- For each destination hub, call POST `/v2/shopping/flight-offers` with origin TLV, destination hub code, departure date (tomorrow), return date (tomorrow + days), 1 adult
- Extract: airline, departure/arrival times, base fare, baggage inclusion
- Map response to our `Flights` type

### 2. `fetch-weather` — Stormglass
- GET `https://api.stormglass.io/v2/weather/point` with lat/lng for each destination
- Winter params: `airTemperature,snowDepth,cloudCover`
- Summer params: `waterTemperature,swellHeight,swellPeriod,windSpeed`
- Auth via header `Authorization: {STORMGLASS_API_KEY}`
- Map to `WinterConditions` / `SummerConditions`
- Note: Stormglass doesn't have all our fields (freshSnow48h, liftStatus, uvIndex etc.) — we'll compute what we can and mark others as estimates

### 3. `fetch-sentiment` — Firecrawl Search
- Use Firecrawl search endpoint to query e.g. `"Val Thorens snow conditions"` or `"Peniche surf conditions"`
- Extract snippets from top results as sentiment sources
- Use Lovable AI (gemini-2.5-flash) via a 4th edge function to generate vibeScore + summary from the scraped content

### 4. `fetch-destinations` — Orchestrator
- Single entry point called by the frontend
- Accepts `{ mode, days }` 
- Has a static registry of destination metadata (name, country, hub, lat/lng, costs)
- Calls the 3 sub-functions in parallel for each destination
- Merges results into `Destination[]` and returns
- Falls back to mock data fields if any sub-API fails (graceful degradation)

## Frontend Changes

### New: `src/hooks/useDestinations.ts`
- React Query hook calling `supabase.functions.invoke('fetch-destinations')`
- Caches for 15 minutes (API rate limits)
- Falls back to existing mock data on error

### Modified: `Dashboard.tsx`
- Replace `getDestinations(mode)` with `useDestinations(mode)` hook
- Add loading state with skeleton cards
- Show "LIVE" or "MOCK" badge in the top bar

## Config Changes

### `supabase/config.toml`
- Add `[functions.fetch-destinations]` with `verify_jwt = false`
- Add `[functions.fetch-flights]` with `verify_jwt = false`
- Add `[functions.fetch-weather]` with `verify_jwt = false`
- Add `[functions.fetch-sentiment]` with `verify_jwt = false`

## Destination Registry (in orchestrator)

Static lookup table mapping each destination ID to:
- lat/lng coordinates (for Stormglass)
- hub airport code (for Amadeus)
- search query terms (for Firecrawl sentiment)
- costs (kept static — not available from APIs)

This avoids needing a database table while keeping the system functional.

## Rate Limit Considerations

- Amadeus test API: 1 req/100ms — we'll batch with small delays
- Stormglass free tier: 10 requests/day — we'll aggregate multiple destinations into fewer calls where possible and cache aggressively
- Firecrawl: depends on plan — limit to 2 sources per destination

## Implementation Order

1. `fetch-flights` edge function + test
2. `fetch-weather` edge function + test  
3. `fetch-sentiment` edge function + test
4. `fetch-destinations` orchestrator that calls all 3
5. Frontend hook + Dashboard integration with loading/fallback states

