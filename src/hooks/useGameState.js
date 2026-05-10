import { useState, useEffect, useCallback, useMemo } from 'react';

const INITIAL_RESOURCES = {
  gold: 500,
  elixir: 500,
};

const BUILDING_TYPES = {
  TOWN_HALL: {
    id: 'TOWN_HALL',
    name: 'Town Hall',
    cost: { gold: 0, elixir: 0 },
    production: { gold: 0, elixir: 0 },
    storage: { gold: 1000, elixir: 1000 },
  },
  GOLD_MINE: {
    id: 'GOLD_MINE',
    name: 'Gold Mine',
    cost: { gold: 0, elixir: 150 },
    production: { gold: 3, elixir: 0 },
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  ELIXIR_COLLECTOR: {
    id: 'ELIXIR_COLLECTOR',
    name: 'Elixir Collector',
    cost: { gold: 150, elixir: 0 },
    production: { gold: 0, elixir: 3 },
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  BARRACKS: {
    id: 'BARRACKS',
    name: 'Barracks',
    cost: { gold: 0, elixir: 500 },
    production: { gold: 0, elixir: 0 },
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  ARMY_CAMP: {
    id: 'ARMY_CAMP',
    name: 'Army Camp',
    cost: { gold: 0, elixir: 300 },
    production: { gold: 0, elixir: 0 },
    storage: { gold: 0, elixir: 0 },
    capacity: 20,
    limit: 1,
  },
};

export const useGameState = () => {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState([
    { type: 'TOWN_HALL', x: 4, y: 4, id: Date.now() },
  ]);
  const [troops, setTroops] = useState(0);

  const troopCapacity = useMemo(() => {
    return buildings.reduce((acc, b) => {
      const config = BUILDING_TYPES[b.type];
      return acc + (config.capacity || 0);
    }, 0);
  }, [buildings]);

  const addBuilding = useCallback((type, x, y) => {
    const buildingConfig = BUILDING_TYPES[type];
    if (!buildingConfig) return false;

    // Check limit
    if (buildingConfig.limit) {
      const existingCount = buildings.filter(b => b.type === type).length;
      if (existingCount >= buildingConfig.limit) return false;
    }

    if (resources.gold >= buildingConfig.cost.gold && resources.elixir >= buildingConfig.cost.elixir) {
      setResources(prev => ({
        gold: prev.gold - buildingConfig.cost.gold,
        elixir: prev.elixir - buildingConfig.cost.elixir,
      }));
      setBuildings(prev => [...prev, { type, x, y, id: Date.now() }]);
      return true;
    }
    return false;
  }, [resources, buildings]);

  const trainTroop = useCallback(() => {
    const troopCost = 25;
    if (resources.elixir >= troopCost && troops < troopCapacity) {
      setResources(prev => ({ ...prev, elixir: prev.elixir - troopCost }));
      setTroops(prev => prev + 1);
      return true;
    }
    return false;
  }, [resources, troops, troopCapacity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        let goldGain = 0;
        let elixirGain = 0;

        buildings.forEach(b => {
          const config = BUILDING_TYPES[b.type];
          goldGain += config.production.gold;
          elixirGain += config.production.elixir;
        });

        return {
          gold: prev.gold + goldGain,
          elixir: prev.elixir + elixirGain,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [buildings]);

  return {
    resources,
    buildings,
    troops,
    troopCapacity,
    addBuilding,
    trainTroop,
    BUILDING_TYPES,
  };
};
