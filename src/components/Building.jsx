import React from 'react';
import { Home, Pickaxe, Droplets } from 'lucide-react';

const Building = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'TOWN_HALL':
        return <Home className="w-8 h-8 text-white" />;
      case 'GOLD_MINE':
        return <Pickaxe className="w-8 h-8 text-yellow-400" />;
      case 'ELIXIR_COLLECTOR':
        return <Droplets className="w-8 h-8 text-purple-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'TOWN_HALL':
        return 'bg-red-600';
      case 'GOLD_MINE':
        return 'bg-gray-700';
      case 'ELIXIR_COLLECTOR':
        return 'bg-gray-700';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`w-full h-full ${getBgColor()} rounded-md flex items-center justify-center shadow-lg border-2 border-black/20`}
    >
      {getIcon()}
    </div>
  );
};

export default Building;
