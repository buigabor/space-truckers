import OrbitingGameEntity from '@/OrbitingGameEntity';
import { PlanetData } from '@/screens/route-planning/gameData';
import {
  Color3,
  CreateSphere,
  ParticleSystemSet,
  Scene,
  StandardMaterial,
  Texture,
  VolumetricLightScatteringPostProcess,
} from '@babylonjs/core';

import sunParticles from '@/systems/sun.json';

export default class Star extends OrbitingGameEntity {
  private starParticleSystem!: ParticleSystemSet;

  constructor(scene: Scene, options: Partial<PlanetData>) {
    super(scene, options);
    this.autoUpdatePosition = false;
    const starData = options;

    this.mesh = CreateSphere('star', { diameter: starData.scale }, this.scene);
    this.material = new StandardMaterial('starMat', this.scene);
    this.material.diffuseTexture = new Texture(starData.diffuseTexture!, this.scene);
    this.material.ambientTexture = this.material.diffuseTexture;
    this.material.emissiveColor = Color3.White();

    this.scene.onReadyObservable.add(() => {
      this.starParticleSystem = ParticleSystemSet.Parse(sunParticles, this.scene, true);
      this.starParticleSystem.emitterNode = this.mesh!;
      this.starParticleSystem.start();

      new VolumetricLightScatteringPostProcess(
        'godrays',
        1.0,
        this.scene.activeCamera,
        this.mesh,
        50,
        Texture.BILINEAR_SAMPLINGMODE,
        this.scene.getEngine(),
        false,
        this.scene,
      );
    });
  }

  update(deltaTime: number) {
    if (this.rotation) this.rotation.y += deltaTime * 0.0735;
  }
}
