import hazard_icon from '@/assets/space-trucker-ui-asteroid-warning.png';

export enum EncounterZoneName {
  INNER_SYSTEM = 'INNER_SYSTEM',
  ASTEROID_BELT = 'ASTEROID_BELT',
  SPACE_HIGHWAY = 'SPACE_HIGHWAY',
  OUTER_SYSTEM = 'OUTER_SYSTEM',
}

export interface Encounter {
  name: string;
  id: string;
  probability: number;
  image: string;
  scoreModifier: number;
}

export interface EncounterZoneData {
  name: string;
  id: string;
  innerBoundary: number;
  outerBoundary: number;
  encounterRate: number;
  colorCode: string;
  encounters: Encounter[];
}

export const encounterZones = {
  [EncounterZoneName.INNER_SYSTEM]: {
    id: 'inner_system',
    name: 'Inner System',
    innerBoundary: 250,
    outerBoundary: 800,
    encounterRate: 0.333,
    colorCode: '#00ff00',
    encounters: [
      {
        name: 'Solar Flare',
        id: 'solar_flare',
        probability: 0.99,
        image: hazard_icon,
        scoreModifier: 0.0,
      },
      {
        name: 'Coronal Mass Ejection',
        id: 'cme',
        probability: 0.015,
        image: '',
        scoreModifier: 0.015,
      },
      { name: '', id: 'no_encounter', probability: 0.01, image: '', scoreModifier: 0.0 },
      {
        name: 'Magnetic Reconnection',
        id: 'magnetic_reconnect',
        probability: 0.01,
        image: '',
        scoreModifier: 0.15,
      },
    ],
  },
  [EncounterZoneName.ASTEROID_BELT]: {
    id: 'asteroid_belt',
    name: 'Asteroid Belt',
    innerBoundary: 1000,
    outerBoundary: 1700,
    encounterRate: 0.425,
    colorCode: '#ff0000',
    encounters: [
      {
        name: 'Rock Hazard',
        id: 'rock_hazard',
        image: hazard_icon,
        probability: 0.89,
        scoreModifier: 0.019,
      },
      {
        name: 'Rock Monster',
        id: 'rock_monster',
        image: '',
        probability: 0.01,
        scoreModifier: 0.25,
      },
      { name: '', id: 'no_encounter', probability: 0.1, image: '', scoreModifier: 0.0 },
      {
        name: 'Momentum Tether',
        id: 'momentum_tether',
        probability: 0.01,
        image: '',
        scoreModifier: 0.15,
      },
    ],
  },
  [EncounterZoneName.SPACE_HIGHWAY]: {
    id: 'space_highway',
    name: 'Space Highway',
    innerBoundary: 1800,
    outerBoundary: 2500,
    encounterRate: 0.389,
    colorCode: '#ffff00',
    encounters: [
      { name: '', id: 'no_encounter', probability: 0.01, image: '', scoreModifier: 0.0 },
      {
        name: 'Lane Closure',
        id: 'road_construction',
        probability: 0.99,
        image: '',
        scoreModifier: 0.0,
      },
      {
        name: 'Detour',
        id: 'space_detour',
        probability: 0.18,
        image: '',
        scoreModifier: 0.05,
      },
      {
        name: 'Nav Flagger',
        id: 'nav_flagger',
        probability: 0.01,
        image: '',
        scoreModifier: 0.25,
      },
      {
        name: 'Momentum Tether',
        id: 'momentum_tether',
        probability: 0.01,
        image: '',
        scoreModifier: 0.15,
      },
    ],
  },
  [EncounterZoneName.OUTER_SYSTEM]: {
    id: 'outer_system',
    name: 'Outer System',
    innerBoundary: 2600,
    outerBoundary: 5000,
    encounterRate: 0.1,
    colorCode: '#ff00ff',
    encounters: [
      { name: '', id: 'no_encounter', probability: 0.001, image: '', scoreModifier: 0.0 },
      {
        name: 'Wandering Space-Herd',
        id: 'space_herd',
        probability: 0.79,
        image: '',
        scoreModifier: 0.215,
      },
      {
        name: 'Primordial Black Hole',
        id: 'black_hole',
        probability: 0.01,
        image: '',
        scoreModifier: 0.5,
      },
      {
        name: 'Space-Porta-Potty',
        id: 'space_potty',
        probability: 0.1,
        image: '',
        scoreModifier: 0.15,
      },
    ],
  },
};
