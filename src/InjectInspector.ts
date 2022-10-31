import { Scene } from "@babylonjs/core";

const injectInspectorFn = async (scene: Scene) => {
    if (!scene) return;
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
};

export const InjectInspector = (target: any) => {
    // save a reference to the original constructor
    const original = target;

    // the new constructor behaviour
    const f: any = function (...args: any[]) {
        console.log("Hook before original constructor...");

        const newArgs = [...args].reverse();

        const instance = new original(...newArgs);

        console.log("Hook after original constructor...");

        injectInspectorFn(instance.scene);

        return instance;
    };

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return f;
};
