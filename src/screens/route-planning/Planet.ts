import OrbitingGameEntity from '@/OrbitingGameEntity';
import { PlanetData } from '@/screens/route-planning/gameData';
import {
  Color3,
  Mesh,
  MeshBuilder,
  NodeMaterial,
  PBRMaterial,
  Scene,
  Texture,
} from '@babylonjs/core';

export default class Planet extends OrbitingGameEntity {
  public planetData: PlanetData;

  public mesh: Mesh;

  public diameter: number;

  get name() {
    return this.planetData?.name;
  }

  constructor(scene: Scene, planetData: PlanetData) {
    super(scene, planetData);
    this.planetData = planetData;
    this.diameter = planetData.scale;

    const planet = (this.mesh = MeshBuilder.CreateSphere(
      planetData.name,
      { diameter: planetData.scale },
      this.scene,
    ));

    planet.rotation.x = Math.PI;
    let planetMat;

    if (planetData.nodeMaterial) {
      planetMat = this.createNodeMaterial(planetData);
    } else {
      planetMat = this.createPBRMaterial(planetData);
    }

    planet.material = planetMat;
  }

  private createNodeMaterial(planetData: PlanetData) {
    const planetMat = NodeMaterial.Parse(planetData.nodeMaterial, this.scene, '');
    return planetMat;
  }

  private createPBRMaterial(planetData: PlanetData) {
    const planetMat = new PBRMaterial(planetData.name + '-mat', this.scene);
    planetMat.roughness = 0.988;
    planetMat.metallic = 0.001;

    if (planetData.diffuseTexture) {
      planetMat.albedoTexture = new Texture(planetData.diffuseTexture, this.scene);
    } else {
      planetMat.albedoColor = planetData.color ?? Color3.White();
    }

    if (planetData.normalTexture) {
      planetMat.bumpTexture = new Texture(planetData.normalTexture, this.scene);
      planetMat.forceIrradianceInFragment = true;
    }

    if (planetData.specularTexture) {
      planetMat.reflectivityTexture = new Texture(planetData.specularTexture, this.scene);
    } else {
      planetMat.emissiveColor = new Color3(25 / 255, 25 / 255, 25 / 255);
    }

    if (planetData.lightMapUrl) {
      planetMat.lightmapTexture = new Texture(planetData.lightMapUrl, this.scene);
    }

    planetMat.directIntensity = planetData.directIntensity ?? 1.0;

    return planetMat;
  }
}
