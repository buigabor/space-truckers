import logger from '@/logger';
import { SpaceTruckerLoadingScreen } from '@/screens/loading/SpaceTruckerLoadingScreen';
import MainMenuScreen from '@/screens/main-menu/MainMenuScreen';
import { Screen } from '@/screens/Screen';
import SplashScreen from '@/screens/splash/SplashScreen';
import setBaseAssetURL from '@/systems/setBaseAssetURL';
import { Engine } from '@babylonjs/core';
import { AppStates } from './appstates';

setBaseAssetURL();
export default class SpaceTruckerApplication {
  private engine: Engine;

  private currentScreen: Screen | null;

  private stateMachine: Generator<AppStates | null, AppStates | null, AppStates | null>;

  private mainMenu!: MainMenuScreen;

  private splashScreen!: SplashScreen;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
    this.engine.loadingScreen = new SpaceTruckerLoadingScreen(this.engine);
    this.currentScreen = null;
    this.stateMachine = this.appStateMachine();
    // this.scene = createScene(this.engine, this.canvas);

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  *appStateMachine(): Generator<AppStates | null, AppStates | null, AppStates | null> {
    let previousState: AppStates | null = null;
    let currentState: AppStates | null = null;

    function setState(newState: AppStates) {
      previousState = currentState;
      currentState = newState;
      logger.logInfo(
        'App state changed. Previous state:' + previousState + ' New state: ' + newState,
      );
      return newState;
    }

    while (true) {
      let nextState = yield currentState;
      if (nextState !== null && nextState !== undefined) {
        setState(nextState);
        if (nextState === AppStates.EXITING) {
          return currentState;
        }
      }
    }
  }

  async initialize() {
    this.engine.enterFullscreen(false);
    this.engine.displayLoadingUI();
    this.moveNextAppState(AppStates.INITIALIZING);
    // for simulating loading times
    const p = new Promise<void>(res => {
      setTimeout(() => res(), 1500);
    });
    await p;

    this.splashScreen = new SplashScreen(this.engine);

    this.engine.hideLoadingUI();

    this.goToOpeningCutscene();
  }

  goToOpeningCutscene() {
    this.moveNextAppState(AppStates.CUTSCENE);
    this.currentScreen = this.splashScreen;
    this.splashScreen.onReadyObservable.addOnce(() => {
      this.engine.hideLoadingUI();
      this.splashScreen.run();
    });
    this.currentScreen.actionProcessor?.attachControl();
  }

  goToMainMenu() {
    this.engine.displayLoadingUI();

    this.currentScreen?.actionProcessor?.detachControl();

    if (this.currentScreen?.scene) {
      this.currentScreen.scene.dispose();
    }

    this.currentScreen = null;
    this.mainMenu = new MainMenuScreen(this.engine);

    this.mainMenu.onExitActionObservable.addOnce(() => this.exit());
    this.mainMenu.onPlayActionObservable.addOnce(() => this.goToRunningState());

    this.currentScreen = this.mainMenu;
    this.moveNextAppState(AppStates.MENU);
    this.mainMenu.onMenuEnter(1000);
    this.currentScreen.actionProcessor?.attachControl();

    this.engine.hideLoadingUI();
  }

  goToRunningState() {}

  async run() {
    await this.initialize();
    this.engine.runRenderLoop(() => this.onRender());
  }

  onRender() {
    // update loop
    let state = this.currentState;

    switch (state.value) {
      case AppStates.CREATED:
      case AppStates.INITIALIZING:
        break;
      case AppStates.CUTSCENE:
        this.splashScreen.update();
        if (this.splashScreen.skipRequested) {
          logger.logInfo('in application onRender - skipping splash screen message');
          this.goToMainMenu();
          break;
        }
        break;
      case AppStates.MENU:
        this.mainMenu.update();
        break;
      case AppStates.PLANNING:
        break;
      case AppStates.DRIVING:
        break;
      case AppStates.EXITING:
        break;
      default:
        break;
    }
    this.currentScreen?.scene?.render(true);
  }

  get currentState() {
    return this.stateMachine.next();
  }

  get activeScene() {
    return this.currentScreen;
  }

  moveNextAppState(state: AppStates) {
    return this.stateMachine.next(state).value;
  }

  exit() {
    this.engine.exitFullscreen();
    this.moveNextAppState(AppStates.EXITING);

    if (window) {
      this.engine.dispose();
      window.location?.reload();
    }
  }
}
