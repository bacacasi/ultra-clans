import React from 'react';
import { Coins, Droplet } from 'lucide-react';

const Dashboard = ({ resources }) => {
  return (
    <div className="flex gap-4 p-4 bg-slate-800/80 backdrop-blur rounded-full border-2 border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 px-4 py-1 bg-yellow-600/20 rounded-full border border-yellow-500/50">
        <Coins className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-yellow-50 text-lg">{resources.gold}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-1 bg-purple-600/20 rounded-full border border-purple-500/50">
        <Droplet className="w-5 h-5 text-purple-400" />
        <span className="font-bold text-purple-50 text-lg">{resources.elixir}</span>
      </div>
    </div>
  );
};

export default Dashboard;
