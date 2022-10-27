import {
    Animation,
    Color3,
    Mesh,
    MeshBuilder,
    Nullable,
    Observer,
    ParticleSystemSet,
    Scalar,
    Scene,
    StandardMaterial,
    Texture,
    TrailMesh,
} from "@babylonjs/core";
import sunParticles from "@/systems/sun.json";

import rockTextureN from "../assets/textures/rockn.png";
import rockTexture from "../assets/textures/rock.png";
import distortTexture from "../assets/textures/distortion.png";

interface PlanetOptions {
    name: string;
    posRadians: number;
    posRadius: number;
    scale: number;
    color: Color3;
    rocky: boolean;
}

interface Planet extends Mesh {
    orbitOptions: PlanetOptions;
    orbitAnimationObserver: Nullable<Observer<Scene>>;
}

export class AstroFactory {
    static createStar(scene: Scene) {
        const starDiam = 16;
        const star = MeshBuilder.CreateSphere(
            "star",
            { diameter: starDiam, segments: 128 },
            scene
        );

        const mat = new StandardMaterial("starMat", scene);

        star.material = mat;

        const starParticleSystem = ParticleSystemSet.Parse(
            sunParticles,
            scene,
            true
        );
        starParticleSystem.emitterNode = star;
        starParticleSystem.start();

        return star;
    }

    static createPlanet(opts: PlanetOptions, scene: Scene) {
        const planet = MeshBuilder.CreateSphere(
            opts.name,
            { diameter: 1 },
            scene
        ) as Planet;

        const mat = new StandardMaterial(planet.name + "-mat", scene);
        mat.diffuseColor = mat.specularColor = opts.color;
        mat.specularPower = 0;

        if (opts.rocky) {
            mat.bumpTexture = new Texture(rockTextureN, scene);
            mat.diffuseTexture = new Texture(rockTexture, scene);
        } else {
            mat.diffuseTexture = new Texture(distortTexture, scene);
        }

        planet.material = mat;
        planet.scaling.setAll(opts.scale);
        planet.position.x = opts.posRadius * Math.sin(opts.posRadians);
        planet.position.z = opts.posRadius * Math.cos(opts.posRadians);

        planet.orbitOptions = opts;

        /* Orbit lines */

        planet.computeWorldMatrix(true);

        const circum = (Math.PI / 3) * opts.posRadius;

        const planetTrail = new TrailMesh(
            planet.name + "-trail",
            planet,
            scene,
            0.1,
            circum,
            true
        );
        const trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);

        trailMat.emissiveColor =
            trailMat.specularColor =
            trailMat.diffuseColor =
                opts.color;
        planetTrail.material = trailMat;

        /* Animation */
        planet.orbitAnimationObserver = this.createAndStartOrbitAnimation(
            planet,
            scene
        );
        const spinAnim = this.createSpinAnimation();
        planet.animations.push(spinAnim);
        scene.beginAnimation(planet, 0, 60, true, Scalar.RandomRange(0.1, 1.5));

        return planet;
    }

    static createAndStartOrbitAnimation(planet: Planet, scene: Scene) {
        /* Quick Math */
        const Gm = 6672.59 * 0.07;
        const opts = planet.orbitOptions;
        const rCubed = Math.pow(opts.posRadius, 3);
        const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
        const v = Math.sqrt(Gm / opts.posRadius);
        const w = v / period;

        let angPos = opts.posRadians;

        const preRenderObsv = scene.onBeforeRenderObservable.add(() => {
            planet.position.x = opts.posRadius * Math.sin(angPos);
            planet.position.z = opts.posRadius * Math.cos(angPos);
            angPos = Scalar.Repeat(angPos + w, Scalar.TwoPi);
        });

        return preRenderObsv;
    }

    static createSpinAnimation() {
        const orbitAnim = new Animation(
            "planetspin",
            "rotation.y",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keyFrames = [];

        keyFrames.push({
            frame: 0,
            value: 0,
        });
        keyFrames.push({
            frame: 60,
            value: Scalar.TwoPi,
        });

        orbitAnim.setKeys(keyFrames);

        return orbitAnim;
    }
}
