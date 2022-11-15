import OrbitingGameEntity from '@/OrbitingGameEntity';
import EncounterManager from '@/screens/route-planning/EncounterManager';
import { GameData } from '@/screens/route-planning/gameData';
import Planet from '@/screens/route-planning/Planet';
import { Mesh, Nullable, PBRMaterial, Scene, TrailMesh } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';

interface CargoOptions extends GameData {
  destination: Planet;
}

interface RouteNode {
  position: Vector3;
  rotationQuaternion: Quaternion;
  scaling: Vector3;
  velocity: Vector3;
  gravity: Vector3;
  time: number;
  distanceTraveled: number;
  encounterZone: any;
}

class CargoUnit extends OrbitingGameEntity {
  private lastVelocity: Nullable<Vector3> = new Vector3(0, 0, 0);

  private lastGravity = new Vector3(0, 0, 0);

  private distanceTraveled = 0.0;

  private timeInTransit = 0.0;

  private originPlanet;

  private options;

  private trailMesh!: TrailMesh | null;

  private routePath: RouteNode[] = [];

  private launchForce = 0.0;

  private encounterManager: EncounterManager;

  private samplingFrequency = 8; //Hz

  private samplingCounter = 0;

  private trailMeshMaterial;

  public isInFlight = false;

  public mass = 0;

  public mesh: Mesh;

  public currentGravity = new Vector3(0, 0, 0);

  get lastFlightPoint() {
    return this.routePath[this.routePath.length - 1];
  }

  get linearVelocity() {
    return this?.physicsImpostor?.getLinearVelocity()?.length() ?? 0;
  }

  constructor(scene: Scene, origin: Planet, options: CargoOptions) {
    super(scene, null);
    this.autoUpdatePosition = false;
    this.options = options;
    this.originPlanet = origin;
    this.mass = this.options.cargoMass;

    this.mesh = CreateBox('cargo', { width: 1, height: 1, depth: 2 }, this.scene);
    this.mesh.rotation = Vector3.Zero();
    this.encounterManager = new EncounterManager(this, scene);
    this.trailMeshMaterial = new PBRMaterial('cargoTrailMaterial', this.scene);
    this.mesh.material = this.trailMeshMaterial;
    this.trailMeshMaterial.emissiveColor = new Color3(0.91, 0.91, 0.2);
  }

  launch(impulse: Vector3) {
    this.isInFlight = true;
    this.trailMesh = new TrailMesh('cargoTrail', this.mesh, this.scene, 3, 10000);
    this.trailMesh.material = this.trailMeshMaterial;
    this.physicsImpostor?.applyImpulse(impulse, this.mesh.getAbsolutePosition());
  }

  reset() {
    console.log('clearing route path of ', this.routePath.length, 'points');
    // this.routePath.forEach(node => (node = null));
    this.routePath = [];
    this.timeInTransit = 0;
    this.distanceTraveled = 0;
    if (this.trailMesh) {
      this.trailMesh.dispose();
      this.trailMesh = null;
    }
    this.position = this.originPlanet.position?.clone().scaleInPlace(1.1);
    this.rotation = Vector3.Zero();

    this.mesh.computeWorldMatrix(true);
    this.isInFlight = false;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (this.isInFlight) {
      this.lastGravity = this.currentGravity.clone();
      const linVel = this.physicsImpostor?.getLinearVelocity();
      this.lastVelocity = linVel ? linVel.clone() : null;

      if (linVel && this.lastVelocity) {
        linVel.normalize();
        this.timeInTransit += deltaTime;
        this.distanceTraveled += this.lastVelocity.length() * deltaTime;
        this.rotation = Vector3.Cross(this.mesh.up, linVel);
      }

      if (this.samplingCounter < this.samplingFrequency) {
        this.samplingCounter += 1;
      } else {
        this.captureRouteData();
        this.samplingCounter = 0;
      }

      this.encounterManager.update(deltaTime);

      if (this.physicsImpostor) {
        this.physicsImpostor.applyImpulse(
          this.currentGravity.scale(deltaTime),
          this.mesh.getAbsolutePosition(),
        );
      }

      this.currentGravity = Vector3.Zero();
    }
  }

  captureRouteData() {
    const position = this.mesh!.position.clone();
    const rotationQuaternion = new Quaternion();

    const scaling = this.lastVelocity ? this.lastVelocity.clone() : Vector3.One();
    const velocity = scaling;
    const gravity = this.lastGravity.clone();
    const time = this.timeInTransit;
    const distanceTraveled = this.distanceTraveled;
    const encounterZone = this.encounterManager.currentZone?.id;

    if (this.mesh.rotationQuaternion) {
      rotationQuaternion.copyFrom(this.mesh.rotationQuaternion);
    } else if (this.rotation) {
      Quaternion.FromEulerVectorToRef(this.rotation, rotationQuaternion);
    }

    const node: RouteNode = {
      position,
      rotationQuaternion: new Quaternion(),
      velocity,
      gravity,
      scaling,
      time,
      distanceTraveled,
      encounterZone,
    };

    this.routePath.push(node);
  }

  destroy() {
    // TODO: play explosion animation and sound
    this.physicsImpostor?.setLinearVelocity(Vector3.Zero());
    this.physicsImpostor?.setAngularVelocity(Vector3.Zero());
  }
}

export default CargoUnit;
