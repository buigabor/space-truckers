import { Mesh } from '@babylonjs/core';
import { SceneOptimizer, SceneOptimizerOptions } from '@babylonjs/core/Misc/sceneOptimizer';

const LOW_DEGRADATION_THRESHOLD = 0.25;
// const MEDIUM_DEGRADATION_THRESHOLD = 0.5;
// const HIGH_DEGRADATION_THRESHOLD = 0.8;

export default (meshWithThinInstances: Mesh, allowedRange = LOW_DEGRADATION_THRESHOLD) => {
  const originalThinInstanceCount = meshWithThinInstances.thinInstanceCount;
  const MAX_INSTANCE_COUNT = originalThinInstanceCount * (1 + allowedRange);
  const MIN_INSTANCE_COUNT = originalThinInstanceCount * (1 - allowedRange);

  const targetFps = 60 * (1 - allowedRange);

  const optimizerOptions = new SceneOptimizerOptions(targetFps, 2000);
  optimizerOptions.addCustomOptimization(
    (_scene, opt) => {
      const currTI = meshWithThinInstances.thinInstanceCount;
      if (!opt.isInImprovementMode) {
        if (currTI <= MIN_INSTANCE_COUNT) {
          console.log('Instance count below minimum. Cannot optimize further.');
          return true;
        }
        console.log('Instance count before removing', currTI);
        meshWithThinInstances.thinInstanceCount = Math.ceil(currTI * 0.91);
      } else {
        console.log('Instance count before adding', currTI);
        if (currTI >= MAX_INSTANCE_COUNT) {
          console.log('Instance count at or above maximum. Cannot optimize further.');
          return true;
        }
        meshWithThinInstances.thinInstanceCount = Math.ceil(currTI * 1.09);
      }

      return false;
    },
    () => 'Change thin instance count',
  );
  const optimizer = new SceneOptimizer(meshWithThinInstances.getScene(), optimizerOptions);

  optimizer.onNewOptimizationAppliedObservable.add(opt => console.log(opt.getDescription()));
  optimizer.onSuccessObservable.add(opt =>
    console.log(
      `Frame rate stabilized at target ${opt.targetFrameRate}fps for ${meshWithThinInstances.thinInstanceCount} thin instances. Current fps: ${opt.currentFrameRate}`,
    ),
  );
  optimizer.onFailureObservable.add(opt =>
    console.log(
      `Can't stabilize frame rate at ${opt.targetFrameRate}fps for ${meshWithThinInstances.thinInstanceCount} thin instances. Current fps: ${opt.currentFrameRate}`,
    ),
  );
  meshWithThinInstances.getScene().onDisposeObservable.add(() => {
    if (optimizer) {
      optimizer.onNewOptimizationAppliedObservable.clear();
      optimizer.onFailureObservable.clear();
      optimizer.onSuccessObservable.clear();
      optimizer.dispose();
    }
  });
  return optimizer;
};
