import { useState } from 'react';
import Grid from './components/Grid';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import { useGameState } from './hooks/useGameState';
import { Shield, Users } from 'lucide-react';

function App() {
  const { resources, buildings, troops, troopCapacity, addBuilding, trainTroop, BUILDING_TYPES } = useGameState();
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

  const handleBuildingClick = (building) => {
    if (building.type === 'BARRACKS') {
        trainTroop();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8 gap-8 font-sans">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic border-b-4 border-blue-600 pb-1">
          Clash Clone
        </h1>
        <Dashboard resources={resources} troops={troops} troopCapacity={troopCapacity} />
      </header>

      <main className="flex gap-8 items-start">
        <Grid
          buildings={buildings}
          onCellClick={handleCellClick}
          onBuildingClick={handleBuildingClick}
        />
        <div className="flex flex-col gap-4">
            <Shop
                buildingTypes={BUILDING_TYPES}
                onSelect={setSelectedBuildingType}
                selectedType={selectedBuildingType}
                buildings={buildings}
            />

            {buildings.some(b => b.type === 'BARRACKS') && (
                <div className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl w-64">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Actions
                    </h2>
                    <button
                        onClick={trainTroop}
                        disabled={troops >= troopCapacity || resources.elixir < 25}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        Train Troop (25)
                    </button>
                    {troops >= troopCapacity && troopCapacity > 0 && (
                        <p className="text-[10px] text-orange-400 mt-2 text-center font-bold">Army Camp Full!</p>
                    )}
                    {troopCapacity === 0 && (
                        <p className="text-[10px] text-red-400 mt-2 text-center font-bold">Need Army Camp!</p>
                    )}
                </div>
            )}
        </div>
      </main>

      <footer className="text-slate-500 text-sm mt-auto max-w-2xl text-center">
        Build mines and collectors for resources. <br/>
        Build <strong>Barracks</strong> to train troops and <strong>Army Camps</strong> to house them. <br/>
        Click on Barracks or use the Actions panel to train troops.
      </footer>
    </div>
  );
}

export default App;
