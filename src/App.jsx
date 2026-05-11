import { useState } from 'react';
import Grid from './components/Grid';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import { useGameState } from './hooks/useGameState';
import { Shield, Users, ArrowBigUpDash, Coins, Droplet, Swords, Target, Heart, Zap, Gem, ShoppingCart } from 'lucide-react';

function App() {
  const {
    mode, resources, buildings, aiBuildings, troops, totalTroops, troopCapacity,
    buildersUsed, deployedUnits, battleResources, addBuilding, trainTroop,
    upgradeBuilding, buyResourcesWithGems, startBattle, endBattle, deployUnit, BUILDING_TYPES, TROOP_TYPES
  } = useGameState();
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [showGemStore, setShowGemStore] = useState(false);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  const [selectedTroopType, setSelectedTroopType] = useState(null);

  const handleCellClick = (x, y) => {
    if (mode === 'BATTLE') {
        if (selectedTroopType) {
            deployUnit(selectedTroopType, x, y);
        }
        return;
    }

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
        <Dashboard
          resources={resources}
          totalTroops={totalTroops}
          troopCapacity={troopCapacity}
          troops={troops}
          buildersUsed={buildersUsed}
        />
      </header>

      <main className="flex gap-8 items-start relative">
        <Grid
          buildings={mode === 'HOME' ? buildings : aiBuildings}
          deployedUnits={deployedUnits}
          onCellClick={handleCellClick}
          onBuildingClick={mode === 'HOME' ? handleBuildingClick : () => {}}
          buildingConfigs={BUILDING_TYPES}
          mode={mode}
        />

        {mode === 'BATTLE' && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 bg-slate-800/90 p-4 rounded-xl border-2 border-blue-500/50 shadow-2xl z-50">
                {Object.entries(TROOP_TYPES).map(([type, config]) => (
                    <button
                        key={type}
                        onClick={() => setSelectedTroopType(type)}
                        className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                            selectedTroopType === type ? 'border-yellow-400 bg-yellow-400/10 scale-110' : 'border-slate-600'
                        } ${troops[type] <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                    >
                        {getTroopIcon(type)}
                        <span className="text-[10px] font-bold text-white">{config.name} x{troops[type]}</span>
                    </button>
                ))}
                <button
                    onClick={endBattle}
                    className="ml-8 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg uppercase italic tracking-tighter"
                >
                    Terminer
                </button>
            </div>
        )}

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
                                    <span>HP: {Array.isArray(BUILDING_TYPES[selectedBuilding.type].hp)
                                        ? BUILDING_TYPES[selectedBuilding.type].hp[selectedBuilding.level]
                                        : BUILDING_TYPES[selectedBuilding.type].hp}</span>
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

      {mode === 'HOME' && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 items-end">
          <button
              onClick={() => setShowGemStore(!showGemStore)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-xl shadow-xl border-b-4 border-emerald-800 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 uppercase italic"
          >
              <ShoppingCart className="w-6 h-6" />
              Magasin
          </button>
          <button
              onClick={startBattle}
              disabled={totalTroops === 0}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-black text-2xl rounded-2xl shadow-2xl border-b-4 border-orange-800 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 uppercase italic"
          >
              <Swords className="w-8 h-8" />
              Attaquer
          </button>
        </div>
      )}

      {showGemStore && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-800 border-2 border-emerald-500 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-4 bg-emerald-600 flex justify-between items-center">
                      <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                          <ShoppingCart className="w-6 h-6" />
                          Magasin de Gemmes
                      </h2>
                      <button
                          onClick={() => setShowGemStore(false)}
                          className="text-white hover:rotate-90 transition-transform"
                      >
                          <Zap className="w-6 h-6 fill-current" />
                      </button>
                  </div>

                  <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                                  <Coins className="w-8 h-8 text-yellow-400" />
                              </div>
                              <div>
                                  <div className="text-white font-bold text-lg">2,000 Or</div>
                                  <div className="text-slate-400 text-xs font-bold uppercase">Ressources</div>
                              </div>
                          </div>
                          <button
                              onClick={() => buyResourcesWithGems('gold')}
                              disabled={resources.gems < 200}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white font-black rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                          >
                              <Gem className="w-4 h-4" />
                              200
                          </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/50">
                                  <Droplet className="w-8 h-8 text-purple-400" />
                              </div>
                              <div>
                                  <div className="text-white font-bold text-lg">2,000 Élixir</div>
                                  <div className="text-slate-400 text-xs font-bold uppercase">Ressources</div>
                              </div>
                          </div>
                          <button
                              onClick={() => buyResourcesWithGems('elixir')}
                              disabled={resources.gems < 200}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white font-black rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                          >
                              <Gem className="w-4 h-4" />
                              200
                          </button>
                      </div>

                      <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-2">
                          Solde actuel: <span className="text-emerald-400">{resources.gems} Gemmes</span>
                      </p>
                  </div>

                  <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                      <button
                          onClick={() => setShowGemStore(false)}
                          className="w-full py-2 text-slate-400 hover:text-white font-bold uppercase tracking-tighter transition-colors"
                      >
                          Fermer
                      </button>
                  </div>
              </div>
          </div>
      )}

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
