import { AstroFactory } from "@/AstroFactory";
import { SceneHolder } from "@/SpaceTruckerApplication";
import {
    ArcRotateCamera,
    Color3,
    Engine,
    GlowLayer,
    ILoadingScreen,
    Mesh,
    PointLight,
    Scalar,
    Scene,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Container, TextBlock } from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

export class SpaceTruckerLoadingScreen implements ILoadingScreen {
    private totalToLoad: number;

    private currentAmountLoaded: number;

    private engine: Engine;

    private startScene: SceneHolder;

    private active: boolean = false;

    private progressAvailable: boolean = false;

    private textContainer: AdvancedDynamicTexture;

    public loadingUIText: string;

    public loadingUIBackgroundColor: string = "black";

    constructor(engine: Engine) {
        this.totalToLoad = 0.0;
        this.loadingUIText = "Loading Space-Truckers: The Video Game...";
        this.currentAmountLoaded = 0.0;
        this.engine = engine;
        this.startScene = createLoadingScene(engine);

        engine.runRenderLoop(() => {
            if (this.startScene && this.active) {
                this.startScene.scene.render();
            }
        });

        this.textContainer = AdvancedDynamicTexture.CreateFullscreenUI(
            "loadingUI",
            true,
            this.startScene.scene
        );
        const textBlock = new TextBlock("textBlock", this.loadingUIText);
        textBlock.fontSize = "62pt";
        textBlock.color = "antiquewhite";

        textBlock.verticalAlignment = Container.VERTICAL_ALIGNMENT_BOTTOM;
        textBlock.paddingTop = "15%";
        this.textContainer.addControl(textBlock);
    }

    displayLoadingUI() {
        this.active = true;
    }
    hideLoadingUI() {
        this.active = false;
    }

    onProgressHandler(evt: any) {
        this.progressAvailable = evt.lengthComputable;
        this.currentAmountLoaded = evt.loaded || this.currentAmountLoaded;
        this.totalToLoad = evt.total || this.currentAmountLoaded;
        if (this.progressAvailable) {
            this.loadingUIText =
                "Loading Space-Truckers: The Video Game... " +
                ((this.currentAmountLoaded / this.totalToLoad) * 100).toFixed(
                    2
                );
        }
    }
}

const createLoadingScene = (engine: Engine) => {
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
