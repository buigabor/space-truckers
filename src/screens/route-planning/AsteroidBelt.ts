import OrbitingGameEntity from '@/OrbitingGameEntity';
import { AsteroidBeltData } from '@/screens/route-planning/gameData';
import {
  Matrix,
  MeshBuilder,
  PBRMaterial,
  Quaternion,
  Scalar,
  Scene,
  Texture,
  Vector3,
} from '@babylonjs/core';

import rockTextureUrl from '@/assets/textures/rock.png';
import rockNormalUrl from '@/assets/textures/rockn.png';
import { getGaussianRandom } from '@/utils/randomGenerator';
import thinInstanceCountOptimization from '@/utils/thinInstanceCountOptimization';

export default class AsteroidBelt extends OrbitingGameEntity {
  private asteroidData: AsteroidBeltData;

  private scalings: Vector3[] = [];

  private positions: Vector3[] = [];

  private rotations: Vector3[] = [];

  private quaternions: Quaternion[] = [];

  private matrices: Matrix[] = [];

  private matrixBuffer: Float32Array;

  private numAsteroids: number;

  constructor(scene: Scene, asteroidBeltOptions: AsteroidBeltData) {
    super(scene, asteroidBeltOptions);
    this.asteroidData = asteroidBeltOptions;

    const numAsteroids = (this.numAsteroids = asteroidBeltOptions.number * 1.5); // allocate a bit more space for the asteroids

    const { density, innerBeltRadius, outerBeltRadius } = asteroidBeltOptions;

    super.setOrbitalParameters(outerBeltRadius + innerBeltRadius / 2);

    const rockMat = new PBRMaterial('rockMat', this.scene);
    rockMat.forceIrradianceInFragment = true;
    rockMat.albedoTexture = new Texture(rockTextureUrl, this.scene);
    rockMat.bumpTexture = new Texture(rockNormalUrl, this.scene);
    rockMat.roughness = 0.9;
    rockMat.metallic = 0.015;

    const asteroidSphere = MeshBuilder.CreateIcoSphere('spsSphere', {
      radius: 5,
      subdivisions: 4,
      flat: true,
    });

    asteroidSphere.material = rockMat;

    for (let i = 0; i < numAsteroids; ++i) {
      this.scalings.push(
        new Vector3(
          getGaussianRandom() * 2 + 1,
          getGaussianRandom() + 1,
          getGaussianRandom() * 2 + 1,
        ),
      );

      let theta = Math.random() * 2 * Math.PI;
      let rTheta = Scalar.RandomRange(
        innerBeltRadius + density * 0.5,
        outerBeltRadius - density * 0.5,
      );

      this.positions.push(
        new Vector3(
          Math.sin(theta) * rTheta,
          (getGaussianRandom() - 0.5) * density,
          Math.cos(theta) * rTheta,
        ),
      );

      this.rotations.push(
        new Vector3(Math.random() * 3.5, Math.random() * 3.5, Math.random() * 3.5),
      );

      this.quaternions.push(new Quaternion());
      this.matrices.push(new Matrix());
    }

    this.matrixBuffer = new Float32Array(numAsteroids * 16);
    this.updateMatrices();
    asteroidSphere.thinInstanceSetBuffer('matrix', this.matrixBuffer);
    asteroidSphere.thinInstanceCount = asteroidBeltOptions.number;

    this.mesh = asteroidSphere;
    const rockOptimizer = thinInstanceCountOptimization(this.mesh);
    this.scene.onReadyObservable.add(() => rockOptimizer.start());
  }

  updateMatrices() {
    for (let i = 0; i < this.numAsteroids; ++i) {
      Quaternion.FromEulerAnglesToRef(
        this.rotations[i].x,
        this.rotations[i].y,
        this.rotations[i].z,
        this.quaternions[i],
      );
      Matrix.ComposeToRef(
        this.scalings[i],
        this.quaternions[i],
        this.positions[i],
        this.matrices[i],
      );
      this.matrices[i].copyToArray(this.matrixBuffer, i * 16);
    }
  }

  update(deltaTime: number) {
    if (this.rotation && this.mesh) {
      this.rotation.y = Scalar.Repeat(
        this.rotation.y + this.angularVelocity * deltaTime,
        Scalar.TwoPi,
      );

      for (let i = 0; i < this.mesh.thinInstanceCount; ++i) {
        this.rotations[i].x += Math.random() * 0.01;
        this.rotations[i].y += Math.random() * 0.02;
        this.rotations[i].z += Math.random() * 0.01;
      }

      this.updateMatrices();
      this.mesh.thinInstanceBufferUpdated('matrix');
    }
  }
}
