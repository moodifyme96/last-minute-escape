import { useState } from 'react';
import { TravelMode } from '@/data/destinations';
import LandingScreen from '@/components/LandingScreen';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [mode, setMode] = useState<TravelMode | null>(null);
  const [days, setDays] = useState(7);
  const [addLuggage, setAddLuggage] = useState(false);

  if (!mode) {
    return (
      <LandingScreen
        onSelectMode={setMode}
        days={days}
        onDaysChange={setDays}
        addLuggage={addLuggage}
        onToggleLuggage={() => setAddLuggage((v) => !v)}
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
    />
  );
};

export default Index;
