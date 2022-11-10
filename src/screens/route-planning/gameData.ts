import { Color3, Scalar, Vector3 } from '@babylonjs/core';

import environmentTextureUrl from '@/assets/environment/crab-nebula-ibl.env';
import ceresDiffuseUrl from '@/assets/textures/2k_ceres_fictional.jpg';
import sunTextureUrl from '@/assets/textures/2k_sun.jpg';
import jupiterTextureUrl from '@/assets/textures/jupiter-globalmap.jpg';
import neptuneUrl from '@/assets/textures/nep0fds1.jpg';
import planetEarthNode from '@/nme/materials/planetEarthMaterial.json';

export const primaryReferenceMass = 4e16;
export const gravConstant = 6.67259e-11; // physical value of 6.67259e-11

const massMultiplier = 1.5;
const distanceMultiplier = 1;
const scaleMultiplier = 1.0;

export interface PlanetData {
  name: string;
  posRadians: number;
  posRadius: number;
  scale: number;
  color: Color3;
  mass: number;
  directIntensity: number | null;
  diffuseTexture: string | null;
  normalTexture: string | null;
  specularTexture: string | null;
  lightMapUrl: string | null;
  nodeMaterial: any;
  autoUpdatePosition: boolean;
}

const planetData: PlanetData[] = [
  {
    name: 'hermes',
    posRadians: Scalar.RandomRange(0, 2 * Math.PI),
    posRadius: 450 * distanceMultiplier,
    scale: 40 * scaleMultiplier,
    color: new Color3(0.45, 0.33, 0.18),
    nodeMaterial: null,
    diffuseTexture: ceresDiffuseUrl,
    normalTexture: null,
    specularTexture: null,
    lightMapUrl: null,
    directIntensity: 0.25,
    mass: 1e14,
    autoUpdatePosition: true,
  },
  {
    name: 'tellus',
    posRadians: Scalar.RandomRange(0, 2 * Math.PI),
    posRadius: 750 * distanceMultiplier,
    scale: 80 * scaleMultiplier,
    color: new Color3(0.91, 0.89, 0.72),
    nodeMaterial: planetEarthNode,
    diffuseTexture: null,
    normalTexture: null,
    specularTexture: null,
    lightMapUrl: null,
    directIntensity: null,
    mass: 3e14,
    autoUpdatePosition: true,
  },
  {
    name: 'zeus',
    posRadians: Scalar.RandomRange(0, 2 * Math.PI),
    posRadius: 2500 * distanceMultiplier,
    scale: 350 * scaleMultiplier,
    color: new Color3(0.17, 0.63, 0.05),
    nodeMaterial: null,
    diffuseTexture: jupiterTextureUrl,
    normalTexture: null,
    specularTexture: null,
    lightMapUrl: null,
    directIntensity: null,
    mass: 7e15,
    autoUpdatePosition: true,
  },
  {
    name: 'janus',
    posRadians: Scalar.RandomRange(0, 2 * Math.PI),
    posRadius: 4000 * distanceMultiplier,
    scale: 300 * scaleMultiplier,
    color: new Color3(0.55, 0, 0),
    nodeMaterial: null,
    diffuseTexture: neptuneUrl,
    normalTexture: null,
    specularTexture: null,
    lightMapUrl: null,
    directIntensity: null,
    mass: 7.4e14,
    autoUpdatePosition: true,
  },
];

export interface AsteroidBeltData {
  density: 390;
  maxScale: Vector3;
  number: number;
  innerBeltRadius: number;
  outerBeltRadius: number;
  posRadians: number;
  posRadius: number;
}

const asteroidBeltOptions: AsteroidBeltData = {
  density: 390,
  maxScale: new Vector3(10.25, 10.25, 10.25),
  number: 10000,
  innerBeltRadius: 900 * distanceMultiplier,
  outerBeltRadius: 1800 * distanceMultiplier,
  posRadians: 0,
  posRadius: 1,
};

export const gameData = {
  planetaryInfo: planetData,
  asteroidBeltOptions,
  startingPlanet: 'hermes',
  endingPlanet: 'zeus',
  cargoMass: 1,
  starData: {
    scale: 500 * scaleMultiplier,
    diffuseTexture: sunTextureUrl,
    mass: primaryReferenceMass,
  },
  environment: {
    environmentTexture: environmentTextureUrl,
    blurParameter: 0,
    IBLIntensity: 0.42,
    lightIntensity: 6000000,
    skyboxScale: 16384,
  },
};

export type GameData = typeof gameData;
