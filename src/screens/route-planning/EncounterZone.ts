import BaseGameEntity from '@/BaseGameEntity';
import { Encounter, EncounterZoneData } from '@/screens/route-planning/encounterZones';
import { Scene } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
import { Observable } from '@babylonjs/core/Misc/observable';

export default class EncounterZone extends BaseGameEntity {
  public id = '';

  private name = '';

  private innerBoundary = 0;

  private outerBoundary = 0;

  private colorCode = '#000000';

  private encounterRate = 0.0;

  private color = Color3.Black();

  private onEnterObservable = new Observable();

  private onExitObservable = new Observable();

  private onEncounterObservable = new Observable();

  private torusDiameter = 0.0;

  private torusThickness = 0.0;

  private encounterTable: Encounter[] = [];

  private cumulativeDistribution: number[] = [];

  constructor(definition: EncounterZoneData, scene: Scene) {
    super(scene);
    this.name = definition.name;
    this.id = definition.id;
    this.innerBoundary = definition.innerBoundary;
    this.outerBoundary = definition.outerBoundary;
    this.encounterRate = definition.encounterRate;
    this.colorCode = definition.colorCode;
    this.color = Color3.FromHexString(this.colorCode);
    (this.torusDiameter = this.outerBoundary - 0.5 * (this.outerBoundary - this.innerBoundary)),
      (this.torusThickness = this.outerBoundary / 2 - this.innerBoundary / 2);
    this.mesh = CreateTorus(
      this.name + '-Zone',
      {
        diameter: 2 * this.torusDiameter,
        thickness: 2 * this.torusThickness,
        tessellation: 64,
      },
      scene,
    );
    this.mesh.visibility = 0;

    var total = 0;

    definition.encounters.forEach((e, i) => {
      total += e.probability;
      this.encounterTable.push(e);
    });

    this.cumulativeDistribution[0] = this.encounterTable[0].probability / total;
    for (var i = 1; i < definition.encounters.length; i++) {
      this.cumulativeDistribution[i] =
        this.cumulativeDistribution[i - 1] + definition.encounters[i].probability / total;
    }
  }
}
