import React from 'react';
import { Coins, Droplet, Users, Hammer, Gem } from 'lucide-react';

const Dashboard = ({ resources, totalTroops, troopCapacity, troops, buildersUsed }) => {
  return (
    <div className="flex flex-col items-center gap-2">
        <div className="flex gap-4 p-4 bg-slate-800/80 backdrop-blur rounded-full border-2 border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 px-4 py-1 bg-yellow-600/20 rounded-full border border-yellow-500/50">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-50 text-lg">{resources.gold}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1 bg-purple-600/20 rounded-full border border-purple-500/50">
                <Droplet className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-purple-50 text-lg">{resources.elixir}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1 bg-emerald-600/20 rounded-full border border-emerald-500/50">
                <Gem className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-50 text-lg">{resources.gems}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1 bg-blue-600/20 rounded-full border border-blue-500/50">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-blue-50 text-lg">{totalTroops} / {troopCapacity}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1 bg-green-600/20 rounded-full border border-green-500/50">
                <Hammer className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-50 text-lg">{2 - buildersUsed} / 2</span>
            </div>
        </div>

        {totalTroops > 0 && (
            <div className="flex gap-3 text-xs">
                {Object.entries(troops).map(([type, count]) => count > 0 && (
                    <div key={type} className="bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        {type}: <span className="text-white font-bold">{count}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Dashboard;
