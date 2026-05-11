import React from 'react';
import { Pickaxe, Droplets, Coins, Droplet, Shield, Tent, Crosshair } from 'lucide-react';

const Shop = ({ buildingTypes, onSelect, selectedType, buildings }) => {
  const getIcon = (key) => {
    switch(key) {
        case 'GOLD_MINE': return <Pickaxe className="w-6 h-6 text-yellow-400" />;
        case 'ELIXIR_COLLECTOR': return <Droplets className="w-6 h-6 text-purple-400" />;
        case 'BARRACKS': return <Shield className="w-6 h-6 text-blue-400" />;
        case 'ARMY_CAMP': return <Tent className="w-6 h-6 text-orange-400" />;
        case 'CANNON': return <Crosshair className="w-6 h-6 text-slate-100" />;
        default: return null;
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl w-64">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Shop</h2>
      <div className="space-y-3">
        {Object.entries(buildingTypes).map(([key, config]) => {
          if (key === 'TOWN_HALL') return null;

          const existingCount = buildings.filter(b => b.type === key).length;
          const isLimitReached = config.limit && existingCount >= config.limit;

          return (
            <button
              key={key}
              disabled={isLimitReached}
              onClick={() => onSelect(key)}
              className={`w-full p-3 rounded-lg border-2 transition-all flex flex-col gap-2 ${
                isLimitReached
                  ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                  : selectedType === key
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-md">
                  {getIcon(key)}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-white">{config.name}</span>
                  {config.limit && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {existingCount} / {config.limit}
                    </span>
                  )}
                </div>
              </div>

              {!isLimitReached ? (
                <div className="flex gap-3 text-sm">
                  {config.cost.gold > 0 && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-3 h-3" />
                      {config.cost.gold}
                    </div>
                  )}
                  {config.cost.elixir > 0 && (
                    <div className="flex items-center gap-1 text-purple-400">
                      <Droplet className="w-3 h-3" />
                      {config.cost.elixir}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-red-400 font-bold uppercase italic">
                  Limit Reached
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedType && (
        <p className="mt-4 text-xs text-blue-400 text-center animate-pulse">
          Click on the grid to place
        </p>
      )}
    </div>
  );
};

export default Shop;
