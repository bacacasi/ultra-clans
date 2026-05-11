import { useState } from 'react';
import Grid from './components/Grid';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import { useGameState } from './hooks/useGameState';
import { Shield, Users, ArrowBigUpDash, Coins, Droplet, Swords, Target, Heart, Zap } from 'lucide-react';

function App() {
  const { resources, buildings, troops, totalTroops, troopCapacity, addBuilding, trainTroop, upgradeBuilding, BUILDING_TYPES, TROOP_TYPES } = useGameState();
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

  const getTroopIcon = (type) => {
      switch(type) {
          case 'BARBARIAN': return <Swords className="w-4 h-4 text-orange-400" />;
          case 'ARCHER': return <Target className="w-4 h-4 text-pink-400" />;
          default: return <Users className="w-4 h-4" />;
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8 gap-8 font-sans">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic border-b-4 border-blue-600 pb-1">
          Clash Clone
        </h1>
        <Dashboard resources={resources} totalTroops={totalTroops} troopCapacity={troopCapacity} troops={troops} />
      </header>

      <main className="flex gap-8 items-start">
        <Grid
          buildings={buildings}
          onCellClick={handleCellClick}
          onBuildingClick={handleBuildingClick}
          buildingConfigs={BUILDING_TYPES}
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
                        {selectedBuilding.status === 'ready' && (
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">Lv.{selectedBuilding.level}</span>
                        )}
                    </h2>

                    <div className="space-y-3">
                        <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                            {BUILDING_TYPES[selectedBuilding.type].hp && (
                                <div className="flex items-center gap-2">
                                    <Heart className="w-3 h-3 text-red-500" />
                                    <span>HP: {BUILDING_TYPES[selectedBuilding.type].hp}</span>
                                </div>
                            )}
                            {BUILDING_TYPES[selectedBuilding.type].damage && (
                                <div className="flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    <span>Damage: {BUILDING_TYPES[selectedBuilding.type].damage}</span>
                                </div>
                            )}
                        </div>

                        {selectedBuilding.type === 'BARRACKS' && selectedBuilding.status === 'ready' && (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Former des troupes</h3>
                                {Object.entries(TROOP_TYPES).map(([type, config]) => {
                                    const isLocked = selectedBuilding.level < config.requiredBarracksLevel;
                                    const canAfford = resources.elixir >= config.cost;
                                    const hasCapacity = totalTroops < troopCapacity;

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => trainTroop(type)}
                                            disabled={isLocked || !canAfford || !hasCapacity}
                                            className={`w-full p-2 rounded-lg border flex flex-col gap-1 transition-all ${
                                                isLocked
                                                ? 'opacity-40 border-slate-700 bg-slate-900 cursor-not-allowed'
                                                : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    {getTroopIcon(type)}
                                                    <span className="text-sm font-bold text-white">{config.name}</span>
                                                </div>
                                                {isLocked && <Shield className="w-3 h-3 text-red-500" />}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    {!isLocked && (
                                                        <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold">
                                                            <Droplet className="w-2.5 h-2.5" />
                                                            {config.cost}
                                                        </div>
                                                    )}
                                                    {isLocked && (
                                                        <span className="text-[8px] text-red-400 uppercase font-black">Niv.{config.requiredBarracksLevel} Requis</span>
                                                    )}
                                                </div>
                                                {config.hp && (
                                                    <div className="flex flex-col items-end text-[8px] text-slate-500 font-bold uppercase">
                                                        <span>HP: {config.hp}</span>
                                                        <span>DMG: {config.damage}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {selectedBuilding.status === 'ready' && selectedBuilding.level < 2 && BUILDING_TYPES[selectedBuilding.type].upgradeCost && (() => {
                            const config = BUILDING_TYPES[selectedBuilding.type];
                            const townHall = buildings.find(b => b.type === 'TOWN_HALL');
                            const isLockedByTH = config.requiredTownHallLevel && (!townHall || townHall.level < config.requiredTownHallLevel);
                            const canAfford = resources.gold >= config.upgradeCost.gold && resources.elixir >= config.upgradeCost.elixir;

                            return (
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => upgradeBuilding(selectedBuilding.id)}
                                    disabled={isLockedByTH || !canAfford}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors mt-2 border-t border-slate-700 pt-3"
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
                                {isLockedByTH && (
                                    <p className="text-[10px] text-red-400 text-center font-bold">HDV {config.requiredTownHallLevel} Requis</p>
                                )}
                            </div>
                            );
                        })()}

                        {selectedBuilding.status === 'upgrading' && (
                            <div className="w-full py-2 bg-slate-700 text-slate-300 font-bold rounded-lg flex flex-col items-center justify-center gap-1">
                                <div className="text-xs uppercase tracking-widest animate-pulse">Amélioration en cours...</div>
                                <div className="w-full px-4">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{
                                                animation: `progress ${BUILDING_TYPES[selectedBuilding.type].upgradeDuration / 1000}s linear`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedBuilding.status === 'constructing' && (
                            <div className="w-full py-2 bg-slate-700 text-slate-300 font-bold rounded-lg flex flex-col items-center justify-center gap-1">
                                <div className="text-xs uppercase tracking-widest animate-pulse">Construction...</div>
                                <div className="w-full px-4">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{
                                                animation: `progress ${BUILDING_TYPES[selectedBuilding.type].constructionDuration / 1000}s linear`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedBuilding.type === 'BARRACKS' && totalTroops >= troopCapacity && troopCapacity > 0 && (
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
        Click on buildings to see actions like <strong>Améliorer</strong> or <strong>Former des troupes</strong>. <br/>
        Defend your base with the <strong>Cannon</strong>!
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
