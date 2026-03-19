import { useState } from 'react';
import { TravelMode } from '@/data/types';
import { motion } from 'framer-motion';
import { ArrowRight, Mountain, MapPin, Globe, Check, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DestinationFilters {
  altitudeRange: [number, number]; // min, max in meters
  countries: string[];             // empty = all
  regions: string[];               // empty = all
  slopeRange: [number, number];    // min, max in km — [0, 9999] = all
}

interface FilterScreenProps {
  mode: TravelMode;
  onApply: (filters: DestinationFilters) => void;
  onBack: () => void;
}

const WINTER_COUNTRIES = [
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "AT", label: "Austria", flag: "🇦🇹" },
  { code: "CH", label: "Switzerland", flag: "🇨🇭" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "BG", label: "Bulgaria", flag: "🇧🇬" },
  { code: "GE", label: "Georgia", flag: "🇬🇪" },
  { code: "AD", label: "Andorra", flag: "🇦🇩" },
  { code: "SK", label: "Slovakia", flag: "🇸🇰" },
  { code: "SE", label: "Sweden", flag: "🇸🇪" },
];

const SUMMER_COUNTRIES = [
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "MA", label: "Morocco", flag: "🇲🇦" },
  { code: "EG", label: "Egypt", flag: "🇪🇬" },
  { code: "GR", label: "Greece", flag: "🇬🇷" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "HR", label: "Croatia", flag: "🇭🇷" },
  { code: "TZ", label: "Tanzania", flag: "🇹🇿" },
];

const WINTER_REGIONS = ["Alps", "Pyrenees", "Balkans", "Caucasus", "Carpathians", "Scandinavia"];
const SUMMER_REGIONS = ["Atlantic Coast", "Mediterranean", "Canary Islands", "Red Sea", "Indian Ocean"];

const ALTITUDE_PRESETS = [
  { label: "ALL", range: [0, 4000] as [number, number] },
  { label: "HIGH\n>2000m", range: [2000, 4000] as [number, number] },
  { label: "MID\n1500–2000m", range: [1500, 2000] as [number, number] },
  { label: "LOW\n<1500m", range: [0, 1500] as [number, number] },
];

const SLOPE_PRESETS = [
  { label: "ALL", range: [0, 9999] as [number, number] },
  { label: "LARGE\n>300km", range: [300, 9999] as [number, number] },
  { label: "MID\n100–300km", range: [100, 300] as [number, number] },
  { label: "SMALL\n<100km", range: [0, 100] as [number, number] },
];

const FilterScreen = ({ mode, onApply, onBack }: FilterScreenProps) => {
  const isWinter = mode === 'winter';
  const countries = isWinter ? WINTER_COUNTRIES : SUMMER_COUNTRIES;
  const regions = isWinter ? WINTER_REGIONS : SUMMER_REGIONS;

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [altitudeRange, setAltitudeRange] = useState<[number, number]>([0, 4000]);
  const [slopeRange, setSlopeRange] = useState<[number, number]>([0, 9999]);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleApply = () => {
    onApply({
      altitudeRange,
      countries: selectedCountries,
      regions: selectedRegions,
      slopeRange,
    });
  };

  const accentColor = isWinter ? 'text-terminal-cyan' : 'text-terminal-amber';
  const borderAccent = isWinter ? 'border-terminal-cyan' : 'border-terminal-amber';
  const bgAccent = isWinter ? 'bg-terminal-cyan/10' : 'bg-terminal-amber/10';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 scanline">
      <motion.div
        className="w-full max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center">
          <div className={cn("text-[10px] tracking-[0.5em] uppercase mb-2", accentColor)}>
            ── {isWinter ? '❄ WINTER' : '☀ SUMMER'} FILTERS ──
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            NARROW YOUR SEARCH
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select preferences to focus on the best destinations. Leave empty for all.
          </p>
        </div>

        {/* Altitude Filter (Winter only) */}
        {isWinter && (
          <div className="border border-border rounded-sm p-4 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Mountain className={cn("w-4 h-4", accentColor)} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ ALTITUDE RANGE</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ALTITUDE_PRESETS.map(preset => {
                const isSelected = altitudeRange[0] === preset.range[0] && altitudeRange[1] === preset.range[1];
                return (
                  <button
                    key={preset.label}
                    onClick={() => setAltitudeRange(preset.range)}
                    className={cn(
                      'border rounded-sm p-3 text-center transition-all cursor-pointer',
                      isSelected
                        ? `${borderAccent} ${bgAccent} text-foreground`
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    <div className="text-[10px] font-bold whitespace-pre-line">{preset.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Countries */}
        <div className="border border-border rounded-sm p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className={cn("w-4 h-4", accentColor)} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ COUNTRIES</span>
            </div>
            {selectedCountries.length > 0 && (
              <button
                onClick={() => setSelectedCountries([])}
                className="text-[9px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                CLEAR ALL
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {countries.map(c => {
              const isSelected = selectedCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs transition-all cursor-pointer',
                    isSelected
                      ? `${borderAccent} ${bgAccent} text-foreground`
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  <span>{c.flag}</span>
                  <span className="font-bold">{c.label}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">
            {selectedCountries.length === 0 ? 'All countries included' : `${selectedCountries.length} selected`}
          </p>
        </div>

        {/* Regions */}
        <div className="border border-border rounded-sm p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className={cn("w-4 h-4", accentColor)} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ REGIONS</span>
            </div>
            {selectedRegions.length > 0 && (
              <button
                onClick={() => setSelectedRegions([])}
                className="text-[9px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                CLEAR ALL
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {regions.map(r => {
              const isSelected = selectedRegions.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRegion(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-sm border text-xs font-bold transition-all cursor-pointer',
                    isSelected
                      ? `${borderAccent} ${bgAccent} text-foreground`
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  {r}
                  {isSelected && <Check className="w-3 h-3 inline ml-1" />}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">
            {selectedRegions.length === 0 ? 'All regions included' : `${selectedRegions.length} selected`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border border-border rounded-sm py-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all cursor-pointer"
          >
            ← BACK
          </button>
          <motion.button
            onClick={handleApply}
            className={cn(
              'flex-[2] border rounded-sm py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
              borderAccent, bgAccent, 'text-foreground hover:opacity-90'
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            SEARCH DESTINATIONS
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterScreen;
