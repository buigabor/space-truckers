export type ScreenActionFunction = (priorState: boolean, inputParam?: any) => boolean | void;

export interface InputAction {
  action: Action;
  shouldBounce: () => boolean;
}

export enum Action {
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  ROTATE_LEFT = 'ROTATE_LEFT',
  ROTATE_RIGHT = 'ROTATE_RIGHT',
  ROTATE_UP = 'ROTATE_UP',
  ROTATE_DOWN = 'ROTATE_DOWN',
  PAUSE = 'PAUSE',
  GO_BACK = 'GO_BACK',
  ACTIVATE = 'ACTIVATE',
  MOVE_IN = 'MOVE_IN',
  MOVE_OUT = 'MOVE_OUT',
}
