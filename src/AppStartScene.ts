import {
    ArcRotateCamera,
    Color3,
    Engine,
    Mesh,
    MeshBuilder,
    PointLight,
    Scalar,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

export class AppStartScene {
    private engine: Engine;
    private scene: Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas);
        this.injectInspector(this.scene);
    }

    run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
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

interface SceneHolder {
    scene: Scene;
    camera: ArcRotateCamera;
    star: any;
    planets: any;
}

const createStartScene = (engine: Engine) => {
    const camAlpha = 0;
    const camBeta = -Math.PI / 4;
    const camDist = 350;
    const camTarget = Vector3.Zero();

    const scene = new Scene(engine);

    const env = setupEnvironment(scene);
    const star = createStar(scene);
    const planets = populatePlanetarySystems(scene);

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

const createStar = (scene: Scene) => {
    const starDiam = 16;
    const star = MeshBuilder.CreateSphere(
        "star",
        { diameter: starDiam, segments: 128 },
        scene
    );

    const mat = new StandardMaterial("starMat", scene);

    star.material = mat;

    // Yellowish color
    mat.emissiveColor = new Color3(0.37, 0.333, 0.11);
    mat.diffuseTexture = new Texture("assets/textures/distortion.png", scene);
    mat.diffuseTexture.level = 1.8;

    return star;
};

interface PlanetOption {
    name: string;
    posRadians: number;
    posRadius: number;
    scale: number;
    color: Color3;
    rocky: boolean;
}

const createPlanet = (opts: PlanetOption, scene: Scene) => {
    const planet = MeshBuilder.CreateSphere(opts.name, { diameter: 1 }, scene);

    const mat = new StandardMaterial(planet.name + "-mat", scene);
    mat.diffuseColor = mat.specularColor = opts.color;
    mat.specularPower = 0;

    if (opts.rocky) {
        mat.bumpTexture = new Texture("assets/textures/rockn.png", scene);
        mat.diffuseTexture = new Texture("assets/textures/rock.png", scene);
    } else {
        mat.diffuseTexture = new Texture(
            "assets/textures/distortion.png",
            scene
        );
    }

    planet.material = mat;
    planet.scaling.setAll(opts.scale);
    planet.position.x = opts.posRadius * Math.sin(opts.posRadians);
    planet.position.z = opts.posRadius * Math.cos(opts.posRadians);

    return planet;
};

const populatePlanetarySystems = (scene: Scene) => {
    let hg = {
        name: "hg",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 14,
        scale: 2,
        color: new Color3(0.45, 0.33, 0.18),
        rocky: true,
    };
    let aphro = {
        name: "aphro",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 35,
        scale: 3.5,
        color: new Color3(0.91, 0.89, 0.72),
        rocky: true,
    };
    let tellus = {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 65,
        scale: 3.75,
        color: new Color3(0.17, 0.63, 0.05),
        rocky: true,
    };
    let ares = {
        name: "ares",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 100,
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
    planetData.forEach((p) => {
        const planet = createPlanet(p, scene);
        // createAndStartOrbitAnimation(planet, scene);

        planet.computeWorldMatrix(true);

        // let planetTrail = new TrailMesh(planet.name + "-trail", planet, scene, .1, planet.orbitOptions.orbitalCircum, true);
        // let trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);
        // trailMat.emissiveColor = trailMat.specularColor = trailMat.diffuseColor = planet.orbitOptions.color;
        // planetTrail.material = trailMat;

        planets.push(planet);
    });

    return planets;
};
