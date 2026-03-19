CREATE TABLE public.destination_conditions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('winter', 'summer')),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  costs JSONB NOT NULL DEFAULT '{}',
  sentiment JSONB NOT NULL DEFAULT '{}',
  condition_sources TEXT[] DEFAULT '{}',
  pricing_sources TEXT[] DEFAULT '{}',
  data_confidence TEXT DEFAULT 'low',
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.destination_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.destination_conditions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow service role write" ON public.destination_conditions
  FOR ALL TO service_role USING (true) WITH CHECK (true);