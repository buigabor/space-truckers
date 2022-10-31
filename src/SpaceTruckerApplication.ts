import logger from "@/logger";
import MainMenuScene from "@/main-menu/MainMenuScene";
import { SpaceTruckerLoadingScreen } from "@/SpaceTruckerLoadingScreen";
import setBaseAssetURL from "@/systems/setBaseAssetURL";
import { ArcRotateCamera, Engine, Mesh, Scene } from "@babylonjs/core";
import { AppStates } from "./appstates";

setBaseAssetURL();
export class SpaceTruckerApplication {
    private engine: Engine;
    private currentScene: Scene | null;
    private stateMachine: Generator<
        AppStates | null,
        AppStates | null,
        AppStates | null
    >;
    private mainMenu!: MainMenuScene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.engine.loadingScreen = new SpaceTruckerLoadingScreen(this.engine);
        this.currentScene = null;
        this.stateMachine = this.appStateMachine();
        // this.scene = createScene(this.engine, this.canvas);

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    *appStateMachine(): Generator<
        AppStates | null,
        AppStates | null,
        AppStates | null
    > {
        let previousState: AppStates | null = null;
        let currentState: AppStates | null = null;

        function setState(newState: AppStates) {
            previousState = currentState;
            currentState = newState;
            logger.logInfo(
                "App state changed. Previous state:" +
                    previousState +
                    " New state: " +
                    newState
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
        const p = new Promise<void>((res) => {
            setTimeout(() => res(), 1500);
        });
        await p;
        this.engine.hideLoadingUI();
        this.goToMainMenu();
    }

    goToMainMenu() {
        this.engine.displayLoadingUI();
        this.mainMenu = new MainMenuScene(this.engine);
        this.engine.hideLoadingUI();
        this.moveNextAppState(AppStates.MENU);
    }

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
                break;
            case AppStates.MENU:
                this.currentScene = this.mainMenu.scene;
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
        this.currentScene?.render(true);
        // this.injectInspector(this.currentScene);
    }

    get currentState() {
        return this.stateMachine.next();
    }

    get activeScene() {
        return this.currentScene;
    }

    moveNextAppState(state: AppStates) {
        return this.stateMachine.next(state).value;
    }
}

const createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
    const mainMenu = new MainMenuScene(engine);
    return mainMenu.scene;
};

export interface SceneHolder {
    scene: Scene;
    camera: ArcRotateCamera;
    star: Mesh;
    planets: Mesh[];
}
