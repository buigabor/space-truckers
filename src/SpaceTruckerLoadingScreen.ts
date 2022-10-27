import { createStartScene, SceneHolder } from "@/SpaceTruckerApplication";
import { Engine, ILoadingScreen } from "@babylonjs/core";
import { AdvancedDynamicTexture, Container, TextBlock } from "@babylonjs/gui";

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
        this.startScene = createStartScene(engine);

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
