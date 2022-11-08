import { Actions, InputAction, ScreenActionFunction } from '@/actions';
import SpaceTruckerInputManager, { Input } from '@/input-management/SpaceTruckerInputManager';
import logger from '@/logger';
import { Screen } from '@/screens/Screen';
import { Scene, setAndStartTimer } from '@babylonjs/core';

type ActionMap = {
  [key in Actions | number]?: ScreenActionFunction;
};

export class SpaceTruckerInputProcessor {
  private controlsAttached: any;

  private scene: Scene;

  private inputManager: SpaceTruckerInputManager;

  private onInputObserver: any;

  private inputQueue: Input[][];

  private lastActionState: any;

  private actionState: any;

  private actionMap: ActionMap;

  public screen: Screen;

  // TODO: Add type
  constructor(screen: Screen, inputManager: SpaceTruckerInputManager, actionList: InputAction[]) {
    this.controlsAttached = false;
    this.screen = screen;
    this.scene = screen.scene;
    this.inputManager = inputManager;
    this.onInputObserver = null;
    this.inputQueue = [];
    this.lastActionState = null;
    this.actionState = {};
    this.actionMap = {};

    this.buildActionMap(actionList, false);
  }

  attachControl() {
    if (!this.controlsAttached) {
      this.scene.attachControl();
      this.inputManager.registerInputForScene(this.scene);
      this.onInputObserver = this.inputManager.onInputAvailableObservable.add(inputs => {
        this.inputAvailableHandler(inputs);
      });
      this.controlsAttached = true;
    }
  }

  detachControl() {
    if (this.controlsAttached) {
      logger.logInfo(`input processor detaching control for screen ${this.screen.name}`);
      this.scene.detachControl();
      this.inputManager.unregisterInputForScene(this.scene);
      this.inputManager.onInputAvailableObservable.remove(this.onInputObserver);
      this.controlsAttached = false;
    }
  }

  update() {
    if (!this.controlsAttached) {
      return;
    }

    this.inputManager.getInputs(this.scene);
    this.lastActionState = this.actionState;
    this.actionState = {};

    while (this.inputQueue.length > 0) {
      const input = this.inputQueue.pop();

      if (input) this.inputCommandHandler(input);
    }
  }

  private inputAvailableHandler(inputs: Input[]) {
    this.inputQueue.push(inputs);
  }

  private buildActionMap(actionList: InputAction[], createNew: boolean) {
    if (createNew) {
      this.actionMap = {};
    }

    actionList.forEach(actionDef => {
      const action = actionDef.action;
      const actionFn = this.screen[action];

      if (!actionFn) {
        return;
      }

      this.actionMap[action] = actionDef.shouldBounce()
        ? bounce(actionFn, 250, this)
        : actionFn.bind(this.screen);
    });
  }

  private inputCommandHandler(input: Input[]) {
    input.forEach(input => {
      const inputParam = input.lastEvent;
      const actionFn = this.actionMap[input.action];

      if (actionFn) {
        const priorState = this.lastActionState ? this.lastActionState[input.action] : null;

        // the way we're dispatching this function in this context results in a loss of the "this" context for the
        // function being dispatched. Calling bind on the function object returns a new function with the correct
        // "this" set as expected. That function is immediately invoked with the target and magnitude parameter values.

        this.actionState[input.action] = actionFn(priorState, inputParam);
        // use the return value of the actionFn to allow handlers to maintain individual states (if they choose).
        // handlers that don't need to maintain state also don't need to know what to return,
        // since undefined == null == false.
      }
    });
  }
}

function bounce(
  funcToBounce: ScreenActionFunction,
  bounceInMilliseconds: number,
  inputProcessor: SpaceTruckerInputProcessor,
) {
  const composer = () => {
    let isBounced = false;

    const observableContext = inputProcessor.screen.scene.onBeforeRenderObservable;

    return (priorState: any, inputParam: any) => {
      if (isBounced) {
        return false;
      }

      isBounced = true;

      setAndStartTimer({
        timeout: bounceInMilliseconds,
        onEnded: () => (isBounced = false),
        contextObservable: observableContext,
      });

      return funcToBounce.call(inputProcessor.screen, priorState, inputParam);
    };
  };

  return composer();
}
