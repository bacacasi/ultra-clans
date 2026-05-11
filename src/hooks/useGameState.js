import { useState, useEffect, useCallback, useMemo } from 'react';

const INITIAL_RESOURCES = {
  gold: 500,
  elixir: 500,
  gems: 250,
};

const TROOP_TYPES = {
  BARBARIAN: {
    id: 'BARBARIAN',
    name: 'Barbarian',
    cost: 15,
    hp: 50,
    damage: 30,
    range: 1.5,
    requiredBarracksLevel: 1,
  },
  ARCHER: {
    id: 'ARCHER',
    name: 'Archer',
    cost: 50,
    hp: 40,
    damage: 20,
    range: 4.0,
    requiredBarracksLevel: 2,
  }
};

const BUILDING_TYPES = {
  TOWN_HALL: {
    id: 'TOWN_HALL',
    name: 'Town Hall',
    cost: { gold: 0, elixir: 0 },
    hp: [0, 500, 800],
    production: { gold: 0, elixir: 0 },
    upgradeCost: { gold: 2000, elixir: 0 },
    upgradeDuration: 60000,
    storage: { gold: [0, 2000, 10000], elixir: [0, 2000, 10000] },
  },
  GOLD_MINE: {
    id: 'GOLD_MINE',
    name: 'Gold Mine',
    category: 'RESOURCES',
    cost: { gold: 0, elixir: 150 },
    hp: [0, 100, 300],
    production: [0, 3, 5],
    upgradeCost: { gold: 0, elixir: 300 },
    upgradeDuration: 5000,
    constructionDuration: 5000,
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  ELIXIR_COLLECTOR: {
    id: 'ELIXIR_COLLECTOR',
    name: 'Elixir Collector',
    category: 'RESOURCES',
    cost: { gold: 150, elixir: 0 },
    hp: [0, 100, 300],
    production: [0, 3, 5],
    upgradeCost: { gold: 300, elixir: 0 },
    upgradeDuration: 5000,
    constructionDuration: 5000,
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  BARRACKS: {
    id: 'BARRACKS',
    name: 'Barracks',
    category: 'ARMY',
    cost: { gold: 0, elixir: 500 },
    hp: 300,
    production: { gold: 0, elixir: 0 },
    upgradeCost: { gold: 500, elixir: 0 },
    upgradeDuration: 5000,
    constructionDuration: 10000,
    requiredTownHallLevel: 2,
    storage: { gold: 0, elixir: 0 },
    limit: 1,
  },
  ARMY_CAMP: {
    id: 'ARMY_CAMP',
    name: 'Army Camp',
    category: 'ARMY',
    cost: { gold: 0, elixir: 300 },
    production: { gold: 0, elixir: 0 },
    storage: { gold: 0, elixir: 0 },
    capacity: 20,
    constructionDuration: 10000,
    limit: 1,
  },
  CANNON: {
    id: 'CANNON',
    name: 'Cannon',
    category: 'DEFENSE',
    cost: { gold: 500, elixir: 0 },
    hp: 150,
    damage: 20,
    constructionDuration: 30000,
    limit: 1,
  }
};

export const useGameState = () => {
  const [mode, setMode] = useState('HOME'); // 'HOME' or 'BATTLE'
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState([
    { type: 'TOWN_HALL', x: 4, y: 4, id: Date.now(), level: 1, status: 'ready' },
  ]);
  const [aiBuildings, setAiBuildings] = useState([]);
  const [troops, setTroops] = useState({});
  const [deployedUnits, setDeployedUnits] = useState([]);
  const [battleResources, setBattleResources] = useState({ gold: 0, elixir: 0 });

  const totalTroops = useMemo(() => {
    return Object.values(troops).reduce((acc, count) => acc + count, 0);
  }, [troops]);

  const buildersUsed = useMemo(() => {
    return buildings.filter(b => b.status === 'constructing' || b.status === 'upgrading').length;
  }, [buildings]);

  const troopCapacity = useMemo(() => {
    return buildings.reduce((acc, b) => {
      const config = BUILDING_TYPES[b.type];
      return acc + (config.capacity || 0);
    }, 0);
  }, [buildings]);

  const generateAIVillage = useCallback(() => {
    const gold = Math.floor(Math.random() * 101) + 50;
    const elixir = Math.floor(Math.random() * 101) + 50;
    setBattleResources({ gold, elixir });

    const layoutType = Math.random() > 0.5 ? 'SMART' : 'RANDOM';
    const newAiBuildings = [];
    const types = ['TOWN_HALL', 'GOLD_MINE', 'ELIXIR_COLLECTOR', 'BARRACKS', 'ARMY_CAMP', 'CANNON'];

    if (layoutType === 'SMART') {
      // TH in center, defense nearby, resources around
      newAiBuildings.push({ type: 'TOWN_HALL', x: 4, y: 4, id: 1, level: 1, status: 'ready', hp: BUILDING_TYPES.TOWN_HALL.hp[1] });
      newAiBuildings.push({ type: 'CANNON', x: 4, y: 3, id: 2, level: 1, status: 'ready', hp: BUILDING_TYPES.CANNON.hp });
      newAiBuildings.push({ type: 'GOLD_MINE', x: 3, y: 4, id: 3, level: 1, status: 'ready', hp: BUILDING_TYPES.GOLD_MINE.hp[1] });
      newAiBuildings.push({ type: 'ELIXIR_COLLECTOR', x: 5, y: 4, id: 4, level: 1, status: 'ready', hp: BUILDING_TYPES.ELIXIR_COLLECTOR.hp[1] });
      newAiBuildings.push({ type: 'BARRACKS', x: 3, y: 3, id: 5, level: 1, status: 'ready', hp: BUILDING_TYPES.BARRACKS.hp });
      newAiBuildings.push({ type: 'ARMY_CAMP', x: 5, y: 3, id: 6, level: 1, status: 'ready', hp: 300 });
    } else {
      // Random dispersion
      const used = new Set();
      types.forEach((type, i) => {
        let rx, ry;
        do {
          rx = Math.floor(Math.random() * 8) + 1;
          ry = Math.floor(Math.random() * 8) + 1;
        } while (used.has(`${rx},${ry}`));
        used.add(`${rx},${ry}`);
        const config = BUILDING_TYPES[type];
        const hp = Array.isArray(config.hp) ? config.hp[1] : (config.hp || 300);
        newAiBuildings.push({ type, x: rx, y: ry, id: i + 1, level: 1, status: 'ready', hp });
      });
    }
    setAiBuildings(newAiBuildings);
  }, []);

  const startBattle = useCallback(() => {
    if (totalTroops === 0) return;
    generateAIVillage();
    setMode('BATTLE');
    setDeployedUnits([]);
  }, [totalTroops, generateAIVillage]);

  const endBattle = useCallback(() => {
    setMode('HOME');
    setDeployedUnits([]);
    setAiBuildings([]);
    // Units used are lost (standard CoC mechanic)
    setTroops({});
  }, []);

  const deployUnit = useCallback((type, x, y) => {
    if (mode !== 'BATTLE' || !(troops[type] > 0)) return;

    setTroops(prev => ({ ...prev, [type]: prev[type] - 1 }));
    setDeployedUnits(prev => [...prev, {
      type,
      x,
      y,
      hp: TROOP_TYPES[type].hp || 50,
      id: Date.now(),
      targetId: null
    }]);
  }, [mode, troops]);

  const maxStorage = useMemo(() => {
    return buildings.reduce((acc, b) => {
      // Allow upgrading buildings to provide storage so capacity doesn't drop to 0
      if (b.status === 'constructing') return acc;

      const config = BUILDING_TYPES[b.type];
      const goldStorage = Array.isArray(config.storage?.gold)
        ? config.storage.gold[b.level]
        : (config.storage?.gold || 0);
      const elixirStorage = Array.isArray(config.storage?.elixir)
        ? config.storage.elixir[b.level]
        : (config.storage?.elixir || 0);

      return {
        gold: acc.gold + goldStorage,
        elixir: acc.elixir + elixirStorage,
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

    if (buildersUsed >= 2) return false;

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

    if (buildersUsed >= 2) return false;

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

  const buyResourcesWithGems = useCallback((type) => {
    if (resources.gems < 200) return false;

    setResources(prev => {
      const newGems = prev.gems - 200;
      const amountToAdd = 2000;

      if (type === 'gold') {
        return {
          ...prev,
          gems: newGems,
          gold: Math.min(prev.gold + amountToAdd, maxStorage.gold)
        };
      } else if (type === 'elixir') {
        return {
          ...prev,
          gems: newGems,
          elixir: Math.min(prev.elixir + amountToAdd, maxStorage.elixir)
        };
      }
      return prev;
    });
    return true;
  }, [resources.gems, maxStorage]);

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
  }, [buildings, maxStorage, mode]);

  // Combat loop
  useEffect(() => {
    if (mode !== 'BATTLE') return;

    const combatInterval = setInterval(() => {
      // 1. Calculate damage to AI Buildings
      setAiBuildings(prevBuildings => {
          if (prevBuildings.length === 0) return prevBuildings;

          const newBuildings = [...prevBuildings];
          let goldLooted = 0;
          let elixirLooted = 0;

          deployedUnits.forEach(unit => {
              let nearest = null;
              let minDist = Infinity;

              prevBuildings.forEach(b => {
                const dist = Math.sqrt(Math.pow(b.x - unit.x, 2) + Math.pow(b.y - unit.y, 2));
                if (dist < minDist) {
                  minDist = dist;
                  nearest = b;
                }
              });

              if (nearest && minDist < TROOP_TYPES[unit.type].range) {
                  const bIndex = newBuildings.findIndex(b => b.id === nearest.id);
                  if (bIndex !== -1) {
                      const damage = TROOP_TYPES[unit.type].damage || 10;
                      newBuildings[bIndex] = { ...newBuildings[bIndex], hp: newBuildings[bIndex].hp - damage };

                      if (newBuildings[bIndex].hp <= 0) {
                          goldLooted += Math.floor(battleResources.gold / prevBuildings.length);
                          elixirLooted += Math.floor(battleResources.elixir / prevBuildings.length);
                          newBuildings.splice(bIndex, 1);
                      }
                  }
              }
          });

          if (goldLooted > 0 || elixirLooted > 0) {
              setResources(r => ({
                  gold: Math.min(r.gold + goldLooted, maxStorage.gold),
                  elixir: Math.min(r.elixir + elixirLooted, maxStorage.elixir)
              }));
          }

          return newBuildings;
      });

      // 2. Move Units and take damage from Cannons
      setDeployedUnits(prevUnits => {
          if (prevUnits.length === 0) return prevUnits;

          const cannons = aiBuildings.filter(b => b.type === 'CANNON');

          return prevUnits.map(unit => {
              // Handle movement
              let nextPos = { x: unit.x, y: unit.y };
              let nearestBuilding = null;
              let minDist = Infinity;

              aiBuildings.forEach(b => {
                  const dist = Math.sqrt(Math.pow(b.x - unit.x, 2) + Math.pow(b.y - unit.y, 2));
                  if (dist < minDist) {
                      minDist = dist;
                      nearestBuilding = b;
                  }
              });

              if (nearestBuilding && minDist >= TROOP_TYPES[unit.type].range) {
                  const dx = nearestBuilding.x - unit.x;
                  const dy = nearestBuilding.y - unit.y;
                  const mag = Math.sqrt(dx*dx + dy*dy);
                  nextPos.x += (dx/mag) * 0.2;
                  nextPos.y += (dy/mag) * 0.2;
              }

              // Take damage from nearest cannon
              let newHp = unit.hp;
              let nearestCannonDist = Infinity;
              cannons.forEach(c => {
                  const dist = Math.sqrt(Math.pow(c.x - unit.x, 2) + Math.pow(c.y - unit.y, 2));
                  if (dist < nearestCannonDist) nearestCannonDist = dist;
              });

              if (nearestCannonDist < 4) {
                  newHp -= 5;
              }

              return { ...unit, ...nextPos, hp: newHp };
          }).filter(u => u.hp > 0);
      });

    }, 500);

    return () => clearInterval(combatInterval);
  }, [mode, aiBuildings, deployedUnits, battleResources, maxStorage]);

  return {
    mode,
    resources,
    buildings,
    aiBuildings,
    troops,
    totalTroops,
    troopCapacity,
    buildersUsed,
    deployedUnits,
    battleResources,
    addBuilding,
    trainTroop,
    upgradeBuilding,
    buyResourcesWithGems,
    startBattle,
    endBattle,
    deployUnit,
    BUILDING_TYPES,
    TROOP_TYPES,
  };
};
