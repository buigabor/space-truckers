import SceneSegment from '@/screens/splash/SceneSegment';
import { Animation, AnimationGroup, Mesh, Observable, Scene } from '@babylonjs/core';

export default class CutSceneSegment implements SceneSegment {
  private animationGroup: AnimationGroup;

  private loopAnimation: boolean;

  public onEnd: Observable<AnimationGroup>;

  constructor(target: Mesh, scene: Scene, ...animationSequence: Animation[]) {
    const animationGroup = new AnimationGroup(target.name + '-animGroupCS', scene);

    for (const animation of animationSequence) {
      animationGroup.addTargetedAnimation(animation, target);
    }

    this.animationGroup = animationGroup;
    this.onEnd = animationGroup.onAnimationGroupEndObservable;
    this.loopAnimation = false;
  }

  start() {
    this.animationGroup.start(this.loopAnimation);
  }

  stop() {
    this.animationGroup.stop();
  }
}
