

## Assessment

The app already has most of what Prompts 1-4 describe built out:
- **Prompt 1** (Shell/State/Routing): Done -- landing screen, mode selection, duration slider, luggage toggle, 96-hour indicator, global state management.
- **Prompt 2** (Data Schema/Cold Dashboard): Done -- 15 winter destinations with altitude, snow depth, freshSnow48h, skipass/rental prices. Grid layout with cards.
- **Prompt 3** (TLV Flight Logic/Cost Aggregator): Done -- flight data, DIY total calculation, Club Med comparison on each card. Luggage toggle updates all cards reactively.
- **Prompt 4** (Intelligence Layer/Sentiment): Done -- NLP sentiment with vibeScore, sources, summary displayed on each card.
- **Prompt 5** (Sun Path): Partially done -- 15 summer destinations exist with water temp, swell, wind, UV data. But missing: **climate guardrail logic** (monsoon blacklist filtering + toast notification) and **default sort by freshSnow48h for winter**.

## What Needs to Be Built

1. **Default sort by `freshSnow48h` (descending) for winter destinations** -- currently destinations render in array order, not sorted by recent snowfall.

2. **Climate guardrail filtering for summer destinations** -- a function that checks the current month against a blacklist array per destination, auto-filters unsafe destinations, and shows a toast notification ("Filtered out X destinations due to monsoon/off-season").

3. **Sorting/filtering controls on the Dashboard** -- the prompts mention sorting by freshSnow48h and a "Show Premium/Club Med" toggle on the filter bar.

4. **"Show Premium/Club Med" toggle** -- when active, cards should flip to hide DIY Total and show only the Premium Package Total.

## Implementation Plan

### 1. Add sort + filter logic to Dashboard
- In `Dashboard.tsx`, sort winter destinations by `freshSnow48h` descending by default.
- For summer destinations, filter out destinations where `safeSeasonFlag === false` based on current month, show a toast with count of filtered destinations.
- Add a `monsoonBlacklist` month array to the summer destination schema (or use the existing `safeSeasonFlag`).

### 2. Add "Show Premium/Club Med" toggle to Dashboard control bar
- Add a boolean state `showPremium` in `Dashboard.tsx`.
- Add a toggle button in the controls bar next to the luggage toggle.
- Pass `showPremium` down to `DestinationCard`.

### 3. Update DestinationCard for Premium toggle
- When `showPremium` is true, hide the DIY breakdown and show only the Club Med/Premium total prominently.
- When false (default), show current DIY layout.

### 4. Add sort dropdown to Dashboard
- Add a select/dropdown for sort options: "Fresh Snow (48h)", "DIY Total (Low→High)", "Vibe Score", "Altitude".
- Summer sort options: "Swell Height", "DIY Total", "Vibe Score", "Water Temp".
- Apply sorting before rendering the grid.

### Files to modify
- `src/components/Dashboard.tsx` -- add sort state, filter logic, premium toggle, toast for monsoon filtering
- `src/components/DestinationCard.tsx` -- accept `showPremium` prop, conditionally render cost zone
- `src/data/types.ts` -- no changes needed (safeSeasonFlag already exists)

