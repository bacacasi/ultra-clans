import { useState, useEffect, useCallback, useMemo } from 'react';

const INITIAL_RESOURCES = {
  gold: 500,
  elixir: 500,
};

const TROOP_TYPES = {
  BARBARIAN: {
    id: 'BARBARIAN',
    name: 'Barbarian',
    cost: 15,
    hp: 50,
    damage: 30,
    requiredBarracksLevel: 1,
  },
  ARCHER: {
    id: 'ARCHER',
    name: 'Archer',
    cost: 50,
    requiredBarracksLevel: 2,
  }
};

const BUILDING_TYPES = {
  TOWN_HALL: {
    id: 'TOWN_HALL',
    name: 'Town Hall',
    cost: { gold: 0, elixir: 0 },
    production: { gold: 0, elixir: 0 },
    upgradeCost: { gold: 2000, elixir: 0 },
    upgradeDuration: 10000,
    storage: { gold: 5000, elixir: 5000 },
  },
  GOLD_MINE: {
    id: 'GOLD_MINE',
    name: 'Gold Mine',
    cost: { gold: 0, elixir: 150 },
    production: [0, 3, 5],
    upgradeCost: { gold: 0, elixir: 300 },
    upgradeDuration: 5000,
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  ELIXIR_COLLECTOR: {
    id: 'ELIXIR_COLLECTOR',
    name: 'Elixir Collector',
    cost: { gold: 150, elixir: 0 },
    production: [0, 3, 5],
    upgradeCost: { gold: 300, elixir: 0 },
    upgradeDuration: 5000,
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  BARRACKS: {
    id: 'BARRACKS',
    name: 'Barracks',
    cost: { gold: 0, elixir: 500 },
    production: { gold: 0, elixir: 0 },
    upgradeCost: { gold: 500, elixir: 0 },
    upgradeDuration: 5000,
    requiredTownHallLevel: 2,
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
  CANNON: {
    id: 'CANNON',
    name: 'Cannon',
    cost: { gold: 500, elixir: 0 },
    hp: 150,
    damage: 20,
    constructionDuration: 30000,
    limit: 1,
  }
};

export const useGameState = () => {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState([
    { type: 'TOWN_HALL', x: 4, y: 4, id: Date.now(), level: 1, status: 'ready' },
  ]);
  const [troops, setTroops] = useState({});

  const totalTroops = useMemo(() => {
    return Object.values(troops).reduce((acc, count) => acc + count, 0);
  }, [troops]);

  const troopCapacity = useMemo(() => {
    return buildings.reduce((acc, b) => {
      const config = BUILDING_TYPES[b.type];
      return acc + (config.capacity || 0);
    }, 0);
  }, [buildings]);

  const maxStorage = useMemo(() => {
    return buildings.reduce((acc, b) => {
      if (b.status !== 'ready') return acc;
      const config = BUILDING_TYPES[b.type];
      return {
        gold: acc.gold + (config.storage?.gold || 0),
        elixir: acc.elixir + (config.storage?.elixir || 0),
      };
    }, { gold: 0, elixir: 0 });
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

      const newBuildingId = Date.now();
      const initialStatus = buildingConfig.constructionDuration ? 'constructing' : 'ready';

      setBuildings(prev => [...prev, { type, x, y, id: newBuildingId, level: 1, status: initialStatus }]);

      if (buildingConfig.constructionDuration) {
          setTimeout(() => {
              setBuildings(prev => prev.map(b =>
                b.id === newBuildingId ? { ...b, status: 'ready' } : b
              ));
          }, buildingConfig.constructionDuration);
      }

      return true;
    }
    return false;
  }, [resources, buildings]);

  const trainTroop = useCallback((troopType) => {
    const troopConfig = TROOP_TYPES[troopType];
    if (!troopConfig) return false;

    const barracks = buildings.find(b => b.type === 'BARRACKS' && b.status === 'ready');
    if (!barracks || barracks.level < troopConfig.requiredBarracksLevel) return false;

    if (resources.elixir >= troopConfig.cost && totalTroops < troopCapacity) {
      setResources(prev => ({ ...prev, elixir: prev.elixir - troopConfig.cost }));
      setTroops(prev => ({
        ...prev,
        [troopType]: (prev[troopType] || 0) + 1
      }));
      return true;
    }
    return false;
  }, [resources, totalTroops, troopCapacity, buildings]);

  const upgradeBuilding = useCallback((id) => {
    const building = buildings.find(b => b.id === id);
    if (!building || building.status === 'upgrading' || building.status === 'constructing' || building.level >= 2) return false;

    const config = BUILDING_TYPES[building.type];
    if (!config || !config.upgradeCost) return false;

    // Check Town Hall level requirement
    if (config.requiredTownHallLevel) {
      const townHall = buildings.find(b => b.type === 'TOWN_HALL');
      if (!townHall || townHall.level < config.requiredTownHallLevel) return false;
    }

    if (resources.gold >= config.upgradeCost.gold && resources.elixir >= config.upgradeCost.elixir) {
      setResources(prev => ({
        gold: prev.gold - config.upgradeCost.gold,
        elixir: prev.elixir - config.upgradeCost.elixir,
      }));

      // Set to upgrading status
      setBuildings(prev => prev.map(b => b.id === id ? { ...b, status: 'upgrading' } : b));

      // Timer to finish upgrade
      setTimeout(() => {
        setBuildings(prev => prev.map(b =>
            b.id === id ? { ...b, level: b.level + 1, status: 'ready' } : b
        ));
      }, config.upgradeDuration);

      return true;
    }
    return false;
  }, [buildings, resources]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        let goldGain = 0;
        let elixirGain = 0;

        buildings.forEach(b => {
          if (b.status !== 'ready') return;

          const config = BUILDING_TYPES[b.type];
          if (Array.isArray(config.production)) {
            const prod = config.production[b.level];
            if (b.type === 'GOLD_MINE') goldGain += prod;
            if (b.type === 'ELIXIR_COLLECTOR') elixirGain += prod;
          } else if (config.production) {
            goldGain += config.production.gold || 0;
            elixirGain += config.production.elixir || 0;
          }
        });

        const newGold = prev.gold + goldGain;
        const newElixir = prev.elixir + elixirGain;

        return {
          gold: Math.min(newGold, maxStorage.gold),
          elixir: Math.min(newElixir, maxStorage.elixir),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [buildings, maxStorage]);

  return {
    resources,
    buildings,
    troops,
    totalTroops,
    troopCapacity,
    addBuilding,
    trainTroop,
    upgradeBuilding,
    BUILDING_TYPES,
    TROOP_TYPES,
  };
};
