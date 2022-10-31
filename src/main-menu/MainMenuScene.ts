import { InjectInspector } from "@/InjectInspector";
import {
    menuBackground,
    MenuItemOptions,
    playBtnOptions,
} from "@/main-menu/menuOptions";
import {
    ArcRotateCamera,
    Engine,
    HemisphericLight,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Image,
    Rectangle,
    TextBlock,
    TextWrapping,
} from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

@InjectInspector
class MainMenuScene {
    private engine: Engine;

    private guiMenu!: AdvancedDynamicTexture;

    private menuContainer!: Rectangle;

    private menuGrid!: Grid;

    public scene: Scene;

    constructor(engine: Engine) {
        let scene = new Scene(engine);

        this.scene = scene;
        this.engine = engine;

        const camera = new ArcRotateCamera(
            "menuCam",
            0,
            0,
            -30,
            Vector3.Zero(),
            this.scene,
            true
        );

        this.setupBackgroundEnvironment();
        this.setupUi();
        this.addMenuItems();
    }

    private setupUi() {
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        gui.renderAtIdealSize = true;
        this.guiMenu = gui;

        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 5;
        menuContainer.cornerRadius = 13;

        this.guiMenu.addControl(menuContainer);
        this.menuContainer = menuContainer;

        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);

        const menuGrid = new Grid("menuGrid");
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addRowDefinition(0.5);
        menuGrid.addRowDefinition(0.5);
        menuContainer.addControl(menuGrid);
        this.menuGrid = menuGrid;

        const titleText = new TextBlock("title", "Space-Truckers");
        titleText.resizeToFit = true;
        // TODO: fix in pillar-of-babylonjs
        titleText.textWrapping = TextWrapping.Ellipsis;
        titleText.fontSize = "72pt";
        titleText.color = "white";
        titleText.width = 0.9;
        titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleText.paddingTop = titleText.paddingBottom = "18px";
        titleText.shadowOffsetX = 3;
        titleText.shadowOffsetY = 6;
        titleText.shadowBlur = 2;
        menuContainer.addControl(titleText);
    }

    private addMenuItems() {
        const playButton = this.createMenuItem(playBtnOptions);
        this.menuGrid.addControl(playButton, this.menuGrid.children.length, 1);
    }

    private createMenuItem(opts: MenuItemOptions) {
        const finalConfig = {
            name: "",
            title: "",
            color: "white",
            background: "green",
            onInvoked: undefined,
            ...opts,
        };

        const btn = Button.CreateSimpleButton(
            finalConfig.name,
            finalConfig.title
        );
        btn.color = finalConfig.name;
        btn.background = finalConfig.background;
        btn.height = "80px";
        btn.thickness = 4;
        btn.cornerRadius = 80;
        btn.shadowOffsetY = 12;
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        btn.fontSize = "36pt";

        btn.onPointerClickObservable.add((ed, es) => {
            if (opts.onInvoked) {
                opts.onInvoked(ed, es);
            }
        });

        return btn;
    }

    private setupBackgroundEnvironment() {
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 0.5, 0),
            this.scene
        );

        const starfieldPT = new StarfieldProceduralTexture(
            "starfieldPT",
            1024,
            this.scene
        );
        const starfieldMat = new StandardMaterial("starfield", this.scene);
        const space = MeshBuilder.CreateCylinder(
            "space",
            {
                height: 64,
                diameterTop: 0,
                diameterBottom: 64,
                tessellation: 512,
            },
            this.scene
        );

        starfieldMat.diffuseTexture = starfieldPT;
        starfieldMat.diffuseTexture.coordinatesMode = Texture.SKYBOX_MODE;
        starfieldMat.backFaceCulling = false;

        starfieldPT.beta = 0.1;
        space.material = starfieldMat;

        return this.scene.onBeforeRenderObservable.add(() => {
            starfieldPT.time += this.scene.getEngine().getDeltaTime() / 1000;
        });
    }
}

export default MainMenuScene;
