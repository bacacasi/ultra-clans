import React from 'react';
import { Pickaxe, Droplets, Coins, Droplet } from 'lucide-react';

const Shop = ({ buildingTypes, onSelect, selectedType }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl w-64">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Shop</h2>
      <div className="space-y-3">
        {Object.entries(buildingTypes).map(([key, config]) => {
          if (key === 'TOWN_HALL') return null;

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full p-3 rounded-lg border-2 transition-all flex flex-col gap-2 ${
                selectedType === key
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-md">
                  {key === 'GOLD_MINE' ? <Pickaxe className="w-6 h-6 text-yellow-400" /> : <Droplets className="w-6 h-6 text-purple-400" />}
                </div>
                <span className="font-semibold text-white">{config.name}</span>
              </div>

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
