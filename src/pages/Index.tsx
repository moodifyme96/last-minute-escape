import { useState } from 'react';
import { TravelMode } from '@/data/types';
import LandingScreen from '@/components/LandingScreen';
import FilterScreen, { DestinationFilters } from '@/components/FilterScreen';
import Dashboard from '@/components/Dashboard';

type AppStep = 'landing' | 'filters' | 'dashboard';

const Index = () => {
  const [step, setStep] = useState<AppStep>('landing');
  const [mode, setMode] = useState<TravelMode | null>(null);
  const [filters, setFilters] = useState<DestinationFilters | null>(null);
  const [days, setDays] = useState(7);
  const [addLuggage, setAddLuggage] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [departureDate, setDepartureDate] = useState<Date>(tomorrow);

  const handleSelectMode = (m: TravelMode) => {
    setMode(m);
    setStep('filters');
  };

  const handleApplyFilters = (f: DestinationFilters) => {
    setFilters(f);
    setStep('dashboard');
  };

  if (step === 'landing' || !mode) {
    return (
      <LandingScreen
        onSelectMode={handleSelectMode}
        days={days}
        onDaysChange={setDays}
        addLuggage={addLuggage}
        onToggleLuggage={() => setAddLuggage(v => !v)}
        departureDate={departureDate}
        onDepartureDateChange={setDepartureDate}
      />
    );
  }

  if (step === 'filters') {
    return (
      <FilterScreen
        mode={mode}
        onApply={handleApplyFilters}
        onBack={() => { setMode(null); setStep('landing'); }}
      />
    );
  }

  return (
    <Dashboard
      mode={mode}
      days={days}
      onDaysChange={setDays}
      addLuggage={addLuggage}
      onToggleLuggage={() => setAddLuggage(v => !v)}
      onBack={() => setStep('filters')}
      departureDate={departureDate}
      onDepartureDateChange={setDepartureDate}
      filters={filters!}
    />
  );
};

export default Index;
