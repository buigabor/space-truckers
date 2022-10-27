import { ParticleSystemSet } from "@babylonjs/core/Particles/particleSystemSet";

export default function () {
    const baseAssetsUrl = document.baseURI.substring(
        0,
        document.baseURI.lastIndexOf("/")
    );

    ParticleSystemSet.BaseAssetsUrl = baseAssetsUrl;
}
