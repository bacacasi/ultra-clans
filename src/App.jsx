import { useState } from 'react';
import Grid from './components/Grid';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import { useGameState } from './hooks/useGameState';
import { Shield, Users, ArrowBigUpDash, Coins, Droplet } from 'lucide-react';

function App() {
  const { resources, buildings, troops, troopCapacity, addBuilding, trainTroop, upgradeBuilding, BUILDING_TYPES } = useGameState();
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  const handleCellClick = (x, y) => {
    if (!selectedBuildingType) {
        setSelectedBuildingId(null);
        return;
    }

    // Check if cell is occupied
    const isOccupied = buildings.some(b => b.x === x && b.y === y);
    if (isOccupied) return;

    const success = addBuilding(selectedBuildingType, x, y);
    if (success) {
      setSelectedBuildingType(null);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuildingId(building.id);
    setSelectedBuildingType(null);
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
                onSelect={(type) => {
                    setSelectedBuildingType(type);
                    setSelectedBuildingId(null);
                }}
                selectedType={selectedBuildingType}
                buildings={buildings}
            />

            {selectedBuilding && (
                <div className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl w-64 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-bold text-white mb-2 border-b border-slate-700 pb-2 flex items-center gap-2">
                        {BUILDING_TYPES[selectedBuilding.type].name}
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">Lv.{selectedBuilding.level}</span>
                    </h2>

                    <div className="space-y-3">
                        {selectedBuilding.type === 'BARRACKS' && selectedBuilding.status === 'ready' && (
                            <button
                                onClick={trainTroop}
                                disabled={troops >= troopCapacity || resources.elixir < 25}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                Train Troop (25)
                            </button>
                        )}

                        {selectedBuilding.status === 'ready' && selectedBuilding.level < 2 && BUILDING_TYPES[selectedBuilding.type].upgradeCost && (
                            <button
                                onClick={() => upgradeBuilding(selectedBuilding.id)}
                                disabled={resources.gold < BUILDING_TYPES[selectedBuilding.type].upgradeCost.gold || resources.elixir < BUILDING_TYPES[selectedBuilding.type].upgradeCost.elixir}
                                className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowBigUpDash className="w-4 h-4" />
                                Améliorer
                                <div className="flex gap-2 text-[10px] ml-1">
                                    {BUILDING_TYPES[selectedBuilding.type].upgradeCost.gold > 0 && (
                                        <div className="flex items-center gap-0.5 text-yellow-300">
                                            <Coins className="w-3 h-3" />
                                            {BUILDING_TYPES[selectedBuilding.type].upgradeCost.gold}
                                        </div>
                                    )}
                                    {BUILDING_TYPES[selectedBuilding.type].upgradeCost.elixir > 0 && (
                                        <div className="flex items-center gap-0.5 text-purple-300">
                                            <Droplet className="w-3 h-3" />
                                            {BUILDING_TYPES[selectedBuilding.type].upgradeCost.elixir}
                                        </div>
                                    )}
                                </div>
                            </button>
                        )}

                        {selectedBuilding.status === 'upgrading' && (
                            <div className="w-full py-2 bg-slate-700 text-slate-300 font-bold rounded-lg flex flex-col items-center justify-center gap-1">
                                <div className="text-xs uppercase tracking-widest animate-pulse">Amélioration en cours...</div>
                                <div className="w-full px-4">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 animate-[progress_5s_linear]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedBuilding.type === 'BARRACKS' && troops >= troopCapacity && troopCapacity > 0 && (
                            <p className="text-[10px] text-orange-400 text-center font-bold">Army Camp Full!</p>
                        )}
                        {selectedBuilding.type === 'BARRACKS' && troopCapacity === 0 && (
                            <p className="text-[10px] text-red-400 text-center font-bold">Need Army Camp!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
      </main>

      <footer className="text-slate-500 text-sm mt-auto max-w-2xl text-center">
        Build mines and collectors for resources. <br/>
        Click on buildings to see actions like <strong>Améliorer</strong> or <strong>Train Troop</strong>.
      </footer>
      <style>{`
        @keyframes progress {
            from { width: 0; }
            to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default App;
