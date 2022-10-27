import { AstroFactory } from "@/AstroFactory";
import { SpaceTruckerLoadingScreen } from "@/SpaceTruckerLoadingScreen";
import setBaseAssetURL from "@/systems/setBaseAssetURL";
import {
    ArcRotateCamera,
    Color3,
    Engine,
    GlowLayer,
    Mesh,
    PointLight,
    Scalar,
    Scene,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";
import { AppStates } from "./appstates";
import logger from "@/logger";

setBaseAssetURL();
export class SpaceTruckerApplication {
    private engine: Engine;
    private scene: Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.engine.loadingScreen = new SpaceTruckerLoadingScreen(this.engine);
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas);
    }

    *appStateMachine() {
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
            let nextState: AppStates | null = yield currentState;
            if (nextState !== null && nextState !== undefined) {
                setState(nextState);
                if (nextState === AppStates.EXITING) {
                    return currentState;
                }
            }
        }
    }

    run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.injectInspector(this.scene);
    }

    public async injectInspector(scene: Scene) {
        try {
            await Promise.all([
                import("@babylonjs/core/Debug/debugLayer"),
                import("@babylonjs/inspector"),
                import("@babylonjs/node-editor"),
            ]);
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
            });
        } catch (e) {
            console.warn("Cannot inject inspector.", e);
        }
    }
}

const createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
    let startScene = createStartScene(engine);

    return startScene.scene;
};

export interface SceneHolder {
    scene: Scene;
    camera: ArcRotateCamera;
    star: Mesh;
    planets: Mesh[];
}

export const createStartScene = (engine: Engine) => {
    const camAlpha = 0;
    const camBeta = -Math.PI / 4;
    const camDist = 350;
    const camTarget = Vector3.Zero();

    const scene = new Scene(engine);

    const env = setupEnvironment(scene);
    const star = AstroFactory.createStar(scene);
    const planets = populatePlanetarySystem(scene);

    const camera = new ArcRotateCamera(
        "camera1",
        camAlpha,
        camBeta,
        camDist,
        camTarget,
        scene
    );
    camera.attachControl(true);

    let sceneHolder: SceneHolder = {
        scene,
        camera,
        star,
        planets,
    };

    return sceneHolder;
};

const setupEnvironment = (scene: Scene) => {
    const starfieldPT = new StarfieldProceduralTexture(
        "starfieldPT",
        512,
        scene
    );
    starfieldPT.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
    starfieldPT.darkmatter = 1.5;
    starfieldPT.distfading = 0.75;

    const envOptions = {
        skyboxSize: 512,
        createGround: false,
        skyboxTexture: starfieldPT,
        environmentTexture: starfieldPT,
    };

    const light = new PointLight("starLight", Vector3.Zero(), scene);
    light.intensity = 2;
    light.diffuse = new Color3(0.98, 0.9, 1);
    light.specular = new Color3(1, 0.9, 0.5);

    const env = scene.createDefaultEnvironment(envOptions);

    return env;
};

const populatePlanetarySystem = (scene: Scene) => {
    let hg = {
        name: "hg",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 25,
        scale: 2,
        color: new Color3(0.45, 0.33, 0.18),
        rocky: true,
    };
    let aphro = {
        name: "aphro",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 45,
        scale: 3.5,
        color: new Color3(0.91, 0.89, 0.72),
        rocky: true,
    };
    let tellus = {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 75,
        scale: 3.75,
        color: new Color3(0.17, 0.63, 0.05),
        rocky: true,
    };
    let ares = {
        name: "ares",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 115,
        scale: 3,
        color: new Color3(0.55, 0, 0),
        rocky: true,
    };
    let zeus = {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 140,
        scale: 6,
        color: new Color3(0, 0.3, 1),
        rocky: false,
    };
    const planetData = [hg, aphro, tellus, ares, zeus];
    const planets: Mesh[] = [];

    const glowLayer = new GlowLayer("glowLayer", scene);

    planetData.forEach((p) => {
        const planet = AstroFactory.createPlanet(p, scene);

        planet.computeWorldMatrix(true);

        glowLayer.addExcludedMesh(planet);
        planets.push(planet);
    });

    return planets;
};
