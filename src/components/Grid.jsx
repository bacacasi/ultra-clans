import React from 'react';
import Building from './Building';
import { Swords, Target } from 'lucide-react';

const Grid = ({ buildings, deployedUnits, onCellClick, onBuildingClick, buildingConfigs, mode }) => {
  const gridSize = 10;
  const cells = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      cells.push(
        <div
          key={`${x}-${y}`}
          className="border border-green-800/30 hover:bg-green-600/20 cursor-pointer transition-colors w-full h-full"
          onClick={() => onCellClick(x, y)}
        />
      );
    }
  }

  return (
    <div className="relative w-[600px] h-[600px] bg-green-700 rounded-xl shadow-2xl overflow-hidden border-8 border-green-900 grid grid-cols-10 grid-rows-10">
      {cells}
      {buildings.map((building) => (
        <div
            key={building.id}
            className="absolute w-[60px] h-[60px] cursor-pointer"
            style={{
                left: building.x * 60,
                top: building.y * 60,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onBuildingClick(building);
            }}
        >
            <Building
              type={building.type}
              level={building.level}
              status={building.status}
              duration={building.status === 'upgrading' ? buildingConfigs[building.type].upgradeDuration : buildingConfigs[building.type].constructionDuration}
              hp={mode === 'BATTLE' ? building.hp : undefined}
              maxHp={mode === 'BATTLE' ? (building.type === 'TOWN_HALL' ? 1000 : (buildingConfigs[building.type].hp || 300)) : undefined}
            />
        </div>
      ))}

      {deployedUnits?.map((unit) => (
          <div
              key={unit.id}
              className="absolute w-[20px] h-[20px] transition-all duration-500 ease-linear flex flex-col items-center"
              style={{
                  left: unit.x * 60 + 20,
                  top: unit.y * 60 + 20,
                  zIndex: 40
              }}
          >
              <div className="w-4 h-4 bg-orange-500 rounded-full border border-black shadow-md flex items-center justify-center">
                  {unit.type === 'BARBARIAN' ? <Swords className="w-2 h-2 text-white" /> : <Target className="w-2 h-2 text-white" />}
              </div>
              <div className="w-6 h-1 bg-black/40 rounded-full mt-0.5 overflow-hidden">
                  <div
                      className="h-full bg-green-500"
                      style={{ width: `${(unit.hp / (unit.type === 'BARBARIAN' ? 50 : 40)) * 100}%` }}
                  />
              </div>
          </div>
      ))}
    </div>
  );
};

export default Grid;
