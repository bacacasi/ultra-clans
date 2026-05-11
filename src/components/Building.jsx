import React from 'react';
import { Home, Pickaxe, Droplets, Shield, Tent, Hammer, Crosshair } from 'lucide-react';

const Building = ({ type, level, status }) => {
  const getIcon = () => {
    if (status === 'upgrading' || status === 'constructing') {
        return <Hammer className="w-8 h-8 text-white animate-bounce" />;
    }

    switch (type) {
      case 'TOWN_HALL':
        return <Home className="w-8 h-8 text-white" />;
      case 'GOLD_MINE':
        return <Pickaxe className={`w-8 h-8 ${level > 1 ? 'text-yellow-200' : 'text-yellow-400'}`} />;
      case 'ELIXIR_COLLECTOR':
        return <Droplets className={`w-8 h-8 ${level > 1 ? 'text-purple-200' : 'text-purple-400'}`} />;
      case 'BARRACKS':
        return <Shield className="w-8 h-8 text-blue-400" />;
      case 'ARMY_CAMP':
        return <Tent className="w-8 h-8 text-orange-400" />;
      case 'CANNON':
        return <Crosshair className="w-8 h-8 text-slate-100" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    if (status === 'upgrading' || status === 'constructing') return 'bg-slate-500';

    switch (type) {
      case 'TOWN_HALL':
        return 'bg-red-600';
      case 'GOLD_MINE':
        return level > 1 ? 'bg-yellow-700' : 'bg-gray-700';
      case 'ELIXIR_COLLECTOR':
        return level > 1 ? 'bg-purple-900' : 'bg-gray-700';
      case 'BARRACKS':
        return 'bg-slate-700';
      case 'ARMY_CAMP':
        return 'bg-amber-900';
      case 'CANNON':
        return 'bg-slate-800';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`w-full h-full ${getBgColor()} rounded-md flex items-center justify-center shadow-lg border-2 border-black/20 relative overflow-hidden transition-colors duration-500`}
    >
      {getIcon()}

      {level > 1 && status === 'ready' && (
        <div className="absolute bottom-0 right-0 bg-black/40 text-[8px] px-1 font-bold text-white rounded-tl">
            Lv.{level}
        </div>
      )}

      {(status === 'upgrading' || status === 'constructing') && (
        <div className="absolute inset-0 bg-black/20 flex items-end">
            <div
                className="h-1 bg-green-500 w-full"
                style={{
                    animation: status === 'upgrading' ? 'progress 5s linear' : 'progress 30s linear'
                }}
            />
        </div>
      )}
    </div>
  );
};

export default Building;
