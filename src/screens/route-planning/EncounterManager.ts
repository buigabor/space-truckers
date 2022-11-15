import CargoUnit from '@/screens/route-planning/CargoUnit';
import EncounterZone from '@/screens/route-planning/EncounterZone';
import { EncounterZoneName, encounterZones } from '@/screens/route-planning/encounterZones';
import { Observable, Scene } from '@babylonjs/core';

const zoneNames = Object.keys(encounterZones) as EncounterZoneName[];

export default class EncounterManager {
  private encounterZones: EncounterZone[] = [];

  private encounterEvents = [];

  private cargo;

  private inAndOut = 0;

  private scene;

  private onNewEncounterObservable = new Observable();

  get currentZone() {
    const zidx = this.encounterZones.length - this.inAndOut;
    return this.encounterZones[zidx];
  }
  constructor(cargo: CargoUnit, scene: Scene) {
    this.scene = scene;
    this.cargo = cargo;
    this.encounterZones = zoneNames.map(
      zoneNames => new EncounterZone(encounterZones[zoneNames], this.scene),
    );
    // this.initialize();
  }

  // private initialize() {
  //   this.encounterEvents = [];
  //   this.encounterZones.forEach(ez => {
  //     const zone = ez;
  //     zone.registerZoneIntersectionTrigger(this.cargo.mesh);
  //     ez.enterObserver = zone.onEnterObservable.add(evt => this.onIntersectEnter(evt));
  //     ez.exitObserver = zone.onExitObservable.add(evt => this.onIntersectExit(evt));
  //     ez.encounterObserver = zone.onEncounterObservable.add(evt => this.onEncounter(evt));
  //   });
  // }

  // teardown() {
  //   this.encounterZones.forEach(ez => {
  //     const zone = ez.zone;
  //     zone.unRegisterZoneIntersectionTrigger(this.cargo.mesh);
  //     zone.onEnterObservable.remove(ez.enterObserver);
  //     zone.onExitObservable.remove(ez.exitObserver);
  //     zone.onEncounterObservable.remove(ez.encounterObserver);
  //   });
  // }

  // onIntersectEnter(evt) {
  //   this.inAndOut++;
  //   console.log(evt.name + ' entered');
  // }
  // onIntersectExit(evt) {
  //   this.inAndOut--;
  //   console.log(evt.name + ' exited');
  // }
  // onEncounter(encounter) {
  //   console.log('Encounter: ' + encounter?.name);
  //   if (!encounter) {
  //     return;
  //   }
  //   const cargoData = this.cargo.lastFlightPoint;
  //   if (!cargoData) {
  //     return;
  //   }
  //   cargoData.encounter = encounter;
  //   const idx = this.encounterEvents.push({ encounter, cargoData });
  //   this.onNewEncounterObservable.notifyObservers(idx - 1);
  // }

  update(deltaTime: number) {
    const cZone = this.currentZone;
    if (cZone) {
      cZone.update(deltaTime);
    }

    // TODO: Update cargo trail mesh's vertice colors to match current encounter zone
  }

  // dispose() {
  //   this.teardown();
  // }
}
