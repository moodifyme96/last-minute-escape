import { useState } from 'react';
import { TravelMode } from '@/data/destinations';
import LandingScreen from '@/components/LandingScreen';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [mode, setMode] = useState<TravelMode | null>(null);
  const [days, setDays] = useState(7);
  const [addLuggage, setAddLuggage] = useState(false);
  
  // Default departure date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [departureDate, setDepartureDate] = useState<Date>(tomorrow);

  if (!mode) {
    return (
      <LandingScreen
        onSelectMode={setMode}
        days={days}
        onDaysChange={setDays}
        addLuggage={addLuggage}
        onToggleLuggage={() => setAddLuggage((v) => !v)}
        departureDate={departureDate}
        onDepartureDateChange={setDepartureDate}
      />
    );
  }

  return (
    <Dashboard
      mode={mode}
      days={days}
      onDaysChange={setDays}
      addLuggage={addLuggage}
      onToggleLuggage={() => setAddLuggage((v) => !v)}
      onBack={() => setMode(null)}
      departureDate={departureDate}
      onDepartureDateChange={setDepartureDate}
    />
  );
};

export default Index;
