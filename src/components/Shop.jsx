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

  const categories = [
    { id: 'RESOURCES', name: 'Ressources' },
    { id: 'ARMY', name: 'Armée' },
    { id: 'DEFENSE', name: 'Défense' }
  ];

  return (
    <div className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl w-64 max-h-[70vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Magasin</h2>
      <div className="space-y-6">
        {categories.map(cat => (
            <div key={cat.id} className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{cat.name}</h3>
                <div className="space-y-2">
                    {Object.entries(buildingTypes)
                        .filter(([_, config]) => config.category === cat.id)
                        .map(([key, config]) => {
                            const existingCount = buildings.filter(b => b.type === key).length;
                            const isLimitReached = config.limit && existingCount >= config.limit;

                            return (
                                <button
                                    key={key}
                                    disabled={isLimitReached}
                                    onClick={() => onSelect(key)}
                                    className={`w-full p-2.5 rounded-lg border-2 transition-all flex flex-col gap-2 ${
                                        isLimitReached
                                        ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-800'
                                        : selectedType === key
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-slate-800 rounded-md">
                                            {getIcon(key)}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-white text-sm tracking-tight">{config.name}</span>
                                            {config.limit && (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase">
                                                    {existingCount} / {config.limit}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!isLimitReached ? (
                                        <div className="flex gap-2 text-[11px] font-bold">
                                            {config.cost.gold > 0 && (
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Coins className="w-2.5 h-2.5" />
                                                    {config.cost.gold}
                                                </div>
                                            )}
                                            {config.cost.elixir > 0 && (
                                                <div className="flex items-center gap-1 text-purple-400">
                                                    <Droplet className="w-2.5 h-2.5" />
                                                    {config.cost.elixir}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-[9px] text-slate-500 font-black uppercase italic">
                                            Limite Atteinte
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    }
                </div>
            </div>
        ))}
      </div>
      {selectedType && (
        <p className="mt-4 text-[10px] text-blue-400 font-bold text-center animate-pulse uppercase tracking-widest">
          Cliquer sur le terrain pour placer
        </p>
      )}
    </div>
  );
};

export default Shop;
