import { useState } from 'react';
import Grid from './components/Grid';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import { useGameState } from './hooks/useGameState';

function App() {
  const { resources, buildings, addBuilding, BUILDING_TYPES } = useGameState();
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);

  const handleCellClick = (x, y) => {
    if (!selectedBuildingType) return;

    // Check if cell is occupied
    const isOccupied = buildings.some(b => b.x === x && b.y === y);
    if (isOccupied) return;

    const success = addBuilding(selectedBuildingType, x, y);
    if (success) {
      setSelectedBuildingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8 gap-8 font-sans">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic border-b-4 border-blue-600 pb-1">
          Clash Clone
        </h1>
        <Dashboard resources={resources} />
      </header>

      <main className="flex gap-8 items-start">
        <Grid
          buildings={buildings}
          onCellClick={handleCellClick}
        />
        <Shop
          buildingTypes={BUILDING_TYPES}
          onSelect={setSelectedBuildingType}
          selectedType={selectedBuildingType}
        />
      </main>

      <footer className="text-slate-500 text-sm mt-auto">
        Build mines and collectors to earn resources. Click shop items then grid to place.
      </footer>
    </div>
  );
}

export default App;
