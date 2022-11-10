import { Mesh, Scene, StandardMaterial } from '@babylonjs/core';

export default class BaseGameEntity {
  public mesh?: Mesh;

  public scene: Scene;

  public lastSceneTime: number;

  get rotation() {
    return this.mesh?.rotation;
  }
  set rotation(value) {
    if (this.mesh && value) this.mesh.rotation = value;
  }

  get position() {
    return this.mesh?.position;
  }
  set position(value) {
    if (this.mesh && value) this.mesh.position = value;
  }

  get forward() {
    return this.mesh?.forward;
  }

  get material() {
    return this.mesh?.material as StandardMaterial;
  }

  set material(value) {
    if (this.mesh && value) this.mesh.material = value;
  }

  get physicsImpostor() {
    return this.mesh?.physicsImpostor;
  }

  set physicsImpostor(value) {
    if (this.mesh && value) this.mesh.physicsImpostor = value;
  }

  constructor(scene: Scene) {
    this.scene = scene;
    this.lastSceneTime = 0;

    this.scene.onDisposeObservable.add(() => this.dispose());
  }

  update(deltaTime: number) {
    this.lastSceneTime += deltaTime;
  }

  dispose() {
    if (this.mesh) {
      this.mesh.dispose();
    }
  }
}
