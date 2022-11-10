import BaseGameEntity from '@/BaseGameEntity';
import { gravConstant, PlanetData, primaryReferenceMass } from '@/screens/route-planning/gameData';
import { Scalar, Scene, Vector3 } from '@babylonjs/core';

export default class OrbitingGameEntity extends BaseGameEntity {
  /*
   * Updated every frame when autoUpdatePosition = true.
   * Provides the current position of the object in terms of its orbit in radius
   */
  public angularPosition = 0.0;

  /*
   * Calculated from the base values.
   * The speed, in radians, of the object's circular motion as it orbits
   */
  public angularVelocity = 0.0;

  /*
   * Calculated from the base values.
   * The amount of time it takes for the object to complete one orbit of 2PI radians.
   */
  public orbitalPeriod = 0.0;

  /*
   * Initial value.
   * The linear distance from the center of the system to the object's circular orbit.
   */
  public orbitalRadius = 1;

  public orbitalVelocity = 0.0;

  public orbitalCircumfrence = 0.0;

  public autoUpdatePosition = false;

  constructor(scene: Scene, orbitalData: Partial<PlanetData> | null) {
    super(scene);
    this.autoUpdatePosition = orbitalData?.autoUpdatePosition ?? true;

    if (this.autoUpdatePosition) {
      this.angularPosition = orbitalData?.posRadians ?? 0.0;
      this.orbitalRadius = orbitalData?.posRadius ?? 0.01;
      this.setOrbitalParameters();
    }
  }

  update(deltaTime: number) {
    if (this.autoUpdatePosition) {
      this.updateOrbitalPosition(deltaTime);
    }
    super.update(deltaTime);
  }

  setOrbitalParameters(orbitalRadius = this.orbitalRadius, primaryMass = primaryReferenceMass) {
    const parameters = this.calculateOrbitalParameters(orbitalRadius, primaryMass);

    this.orbitalPeriod = parameters.orbitalPeriod;
    this.orbitalVelocity = parameters.orbitalVelocity;
    this.angularVelocity = parameters.angularVelocity;
    this.orbitalCircumfrence = parameters.orbitalCircumfrence;
  }

  calculateOrbitalParameters(
    orbitalRadius = this.orbitalRadius,
    referenceMass = primaryReferenceMass,
  ) {
    const Gm = gravConstant * referenceMass;
    const rCubed = Math.pow(orbitalRadius, 3);
    const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
    const v = Math.sqrt(Gm / orbitalRadius);
    const w = v / orbitalRadius;
    const orbitalCircumfrence = Math.pow(Math.PI * orbitalRadius, 2);
    return {
      orbitalPeriod: period,
      orbitalVelocity: v,
      angularVelocity: w,
      orbitalCircumfrence: orbitalCircumfrence,
    };
  }

  updateOrbitalPosition(deltaTime: number) {
    const angPos = this.angularPosition;
    const w = this.angularVelocity * (deltaTime ?? 0.016);
    const posRadius = this.orbitalRadius;

    this.angularPosition = (angPos + w) % Scalar.TwoPi;

    // TODO: support inclined orbits by calculating the z-coordinate using the correct trig fn

    if (this.position) {
      this.position.x = posRadius * Math.sin(this.angularPosition);
      this.position.z = posRadius * Math.cos(this.angularPosition);
    }
  }

  /*
   * Given a world position, it calculates the direction and magnitude of the gravitational force imparted
   * on the object of negligible mass at that position. Only applies if physicsImpostor is set.
   */
  calculateGravitationalForce(position: Vector3) {
    const mass = this.physicsImpostor?.mass;
    const m1Pos = this.position;

    if (!mass || !m1Pos) {
      throw new Error('mass or position is undefined');
    }

    if (mass <= 0) {
      return Vector3.Zero();
    }

    const direction = position.subtract(m1Pos);
    const distanceSq = direction.lengthSquared();

    if (distanceSq <= 0) {
      return Vector3.Zero();
    }

    const gravScale = -(gravConstant * (mass * (1 / distanceSq)));

    if (isNaN(gravScale)) {
      throw new Error('Should not see NaN for gravScale in calculateGravitationalForce!');
    }

    const magnitude = direction.normalize().scaleInPlace(gravScale);

    return magnitude;
  }
}
