import { Actions, ScreenActionFunction } from '@/actions';
import { SpaceTruckerInputProcessor } from '@/input-management/SpaceTruckerInputProcessor';
import { Scene } from '@babylonjs/core';

export interface Screen extends ScreenActions {
  name: string;
  scene: Scene;
  actionProcessor: SpaceTruckerInputProcessor;

  update(): void;
}

type ScreenActions = {
  [key in Actions]?: ScreenActionFunction;
};
