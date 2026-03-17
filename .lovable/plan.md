## Plan: Progressive Loading with Smart Ranking

### Problem

Currently the edge function processes all 15+ destinations in parallel — slow (~79s), expensive, and overwhelming. The user wants the best 4 first, then 3 more on demand.

### Architecture

```text
Request Flow:
                                                
  [Client]                    [Edge Function]                          
  offset=0, limit=4  ──►  1. Quick-rank ALL candidates (LLM + registry metadata)
                           2. Deep-enrich only items [0..3] (Firecrawl + Amadeus + Sentiment)
                           3. Return 4 destinations + total count + ranking order
                                                
  offset=4, limit=3  ──►  1. Re-use same ranking (deterministic per date+mode)
                           2. Deep-enrich only items [4..6]
                           3. Return 3 more destinations
```

### Edge Function Changes (`fetch-destinations/index.ts`)

1. **Accept `offset` and `limit**` params (default 0/4 for initial, then 4/3, 7/3, etc.)
2. **Phase 1 — Fast LLM Ranking** (runs on every call):
  - Send the full registry metadata (name, altitude, region, default costs, season, safe months) to `gemini-2.5-flash-lite` with a simple prompt: "Rank these destinations for a {winter/summer} trip departing {date} for {days} days from Tel Aviv. Consider: current season quality, value for money, accessibility. Return ordered IDs."
  - This is cheap and fast (~2s) — no scraping needed, just reasoning over static metadata + date context.
3. **Phase 2 — Deep Enrichment** (only for the requested slice):
  - Take `ranked[offset..offset+limit]` and run Firecrawl scraping, Amadeus flights, and sentiment only for those destinations.
  - This cuts API calls from ~30 Firecrawl searches + ~20 Amadeus calls down to ~8 + ~5 per request.
4. **Return** `{ data: Destination[], totalAvailable: number, live: LiveFlags, lateSeason: boolean }`

### Frontend Changes

1. `**useDestinations` hook** — add `offset`/`limit` state. Accumulate results across pages. Expose `loadMore()`, `hasMore`, `isLoadingMore`.
2. `**Dashboard.tsx**` — replace the static grid with:
  - Show accumulated destinations
  - "FIND MORE" button at the bottom (styled as terminal button)
  - Show `{shown}/{totalAvailable}` counter
  - When mode/date/days change, reset to offset=0
3. **Remove** the hardcoded `destinations.length` display in the top bar — replace with dynamic `{shown} / {total} DESTINATIONS`.

### Key Decisions

- Ranking is deterministic per (mode, date, days) so pagination is consistent
- Each "Find More" is an independent API call — no server-side session needed
- Late season sorting (altitude-first) is folded into the LLM ranking prompt
- The LLM ranking uses registry defaults as a rough cost proxy — actual prices are only fetched during deep enrichment
- Fast ranking should consider all the sites (or most of them) - need to include a long list.
- &nbsp;