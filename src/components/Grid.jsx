import React from 'react';
import Building from './Building';

const Grid = ({ buildings, onCellClick }) => {
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
            className="absolute w-[60px] h-[60px] pointer-events-none"
            style={{
                left: building.x * 60,
                top: building.y * 60,
            }}
        >
            <Building type={building.type} x={0} y={0} />
        </div>
      ))}
    </div>
  );
};

export default Grid;
