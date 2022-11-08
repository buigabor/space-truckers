import { Actions } from '@/actions';
import {
  InputControlsMap,
  inputControlsMap,
  mapRotationInputToActions,
  mapStickTranslationInputToActions,
  normalizeJoystickInputs,
} from '@/input-management/inputActionMaps';
import logger from '@/logger';
import { Engine, Gamepad, KeyboardEventTypes, Observable, Scene } from '@babylonjs/core';

interface InputSubscription {
  scene: Scene;
  subscriptions: { checkInputs: () => void; dispose: () => void }[];
}

export interface Input {
  action: Actions | number;
  lastEvent: Actions | number;
}

export default class SpaceTruckerInputManager {
  private inputMap: InputControlsMap;

  private engine: Engine;

  private gamepad: Gamepad | null;

  private inputSubscriptions: InputSubscription[];

  private controlsMap: InputControlsMap;

  public onInputAvailableObservable: Observable<Input[]>;

  constructor(engine: Engine, controlsMap = inputControlsMap) {
    this.inputMap = {};
    this.engine = engine;
    this.onInputAvailableObservable = new Observable<Input[]>();
    this.gamepad = null;
    this.inputSubscriptions = [];
    this.controlsMap = controlsMap;
  }

  registerInputForScene(sceneToRegister: Scene) {
    logger.logInfo(`registering input for scene ${sceneToRegister}`);

    const registration = {
      scene: sceneToRegister,
      subscriptions: [
        this.enableKeyboard(sceneToRegister),
        //       this.enableMouse(sceneToRegister),
        this.enableGamepad(sceneToRegister),
      ],
    };

    sceneToRegister.onDisposeObservable.add(() => this.unregisterInputForScene(sceneToRegister));
    this.inputSubscriptions.push(registration);
  }

  getInputs(scene: Scene): Input[] | void {
    const sceneInputHandler = this.inputSubscriptions.find(is => is.scene === scene);
    if (!sceneInputHandler) {
      return;
    }

    sceneInputHandler.subscriptions.forEach(s => s.checkInputs());

    const ik = Object.keys(this.inputMap);
    const inputs = ik.map(key => {
      return {
        action: this.controlsMap[key],
        lastEvent: this.inputMap[key],
      };
    });

    if (inputs && inputs.length > 0) {
      this.onInputAvailableObservable.notifyObservers(inputs);
    }

    return inputs;
  }

  unregisterInputForScene(sceneToUnregister: Scene): void {
    logger.logInfo(`unregistering input controls for scene ${sceneToUnregister}`);
    const subs = this.inputSubscriptions.find(s => s.scene === sceneToUnregister);

    if (!subs) {
      logger.logWarning(`didn't find any subscriptions to unregister, ${this.inputSubscriptions}`);
      return;
    }

    subs.subscriptions.forEach(sub => sub.dispose());
    sceneToUnregister.detachControl();
  }

  private enableKeyboard(scene: Scene) {
    const observer = scene.onKeyboardObservable.add(keyboardInfo => {
      const { key } = keyboardInfo.event;
      const keyMapped = this.controlsMap[key];

      if (!keyMapped) {
        logger.logError(`Unmapped key processed by app: ${key}`);
        return;
      }

      if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
        this.inputMap[key] = keyMapped;
      } else {
        delete this.inputMap[key];
      }
    });

    /**
     * Retrieve inputs and place it into inputMap.
     * For devices that utilize observables in their input surfacing, the checkInput function can be an empty function.
     * nothing. Devices with mixed or solely axis inputs (ex. thumbsticks, joysticks, etc) implement checkInput to the gamepad state every frame.
     */
    const checkInputs = () => {};

    return {
      checkInputs,
      dispose: () => {
        scene.onKeyboardObservable.remove(observer);
      },
    };
  }

  private enableGamepad(sceneToRegister: Scene) {
    const manager = sceneToRegister.gamepadManager;

    const gamepadConnectedObserver = manager.onGamepadConnectedObservable.add(gamepad => {});

    const gamepadDisconnectedObserver = manager.onGamepadDisconnectedObservable.add(gamepad => {
      if (this.gamepad === gamepad) {
        gamepad.dispose();
        this.gamepad = null;
      }
    });

    const checkInputs = () => {
      const inputMap = this.inputMap;
      if (!this.gamepad) {
        return;
      }
      // handle quantitative or input that reads between 0 and 1
      //(on/off) inputs are handled by the onButton/ondPad Observables
      let LSValues = normalizeJoystickInputs(this.gamepad.leftStick);
      mapStickTranslationInputToActions(LSValues, inputMap);

      let RSValues = normalizeJoystickInputs(this.gamepad.rightStick);
      mapRotationInputToActions(RSValues, inputMap);
    };

    return {
      checkInputs,
      dispose: () => {
        this.gamepad = null;
        manager.onGamepadConnectedObservable.remove(gamepadConnectedObserver);
        manager.onGamepadDisconnectedObservable.remove(gamepadDisconnectedObserver);
      },
    };
  }
}
