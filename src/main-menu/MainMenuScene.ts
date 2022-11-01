import { InjectInspector } from "@/InjectInspector.decorator";
import { menuBackground, selectionIcon } from "@/main-menu/menuOptions";
import {
    ArcRotateCamera,
    Engine,
    EventState,
    HemisphericLight,
    MeshBuilder,
    Observable,
    Scalar,
    Scene,
    setAndStartTimer,
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
    Vector2WithInfo,
} from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

export interface MenuItemOptions {
    name?: string;
    title?: string;
    background?: string;
    color?: string;
    onInvoked?: (ed: Vector2WithInfo, es: EventState) => void;
}

@InjectInspector
class MainMenuScene {
    private engine: Engine;

    private guiMenu!: AdvancedDynamicTexture;

    private menuContainer!: Rectangle;

    private menuGrid!: Grid;

    private selectedItemIdx!: number;

    private selectedItemChanged = new Observable<number>();

    private selectorIcon!: Image;

    private selectorAnimationFrame!: number;

    public scene: Scene;

    get selectedItemIndex() {
        return this.selectedItemIdx || -1;
    }

    set selectedItemIndex(idx: number) {
        const itemCount = this.menuGrid.rowCount;
        // TODO: use this in ImageGallery in pillar-of-babylonjs
        const newIdx = Scalar.Repeat(idx, itemCount);
        this.selectedItemIdx = newIdx;
        this.selectedItemChanged.notifyObservers(newIdx);
    }

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
        this.createSelectorIcon();

        this.selectedItemChanged.add((idx) => {
            const menuGrid = this.menuGrid;
            const selectedItem = menuGrid.getChildrenAt(idx, 1);
            if (selectedItem && !selectedItem[0].isEnabled) {
                this.selectedItemIndex = idx + 1;
            }
            this.selectorIcon.isVisible = true;
            menuGrid.removeControl(this.selectorIcon);
            menuGrid.addControl(this.selectorIcon, idx);
        });

        this.scene.whenReadyAsync().then(() => {
            this.selectedItemIndex = 0;
            this.onMenuEnter(1000);
        });
    }

    private onMenuEnter(duration?: number) {
        let fadeIn = 0;
        const fadeTime = duration || 1500;
        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this.scene.onBeforeRenderObservable,
            onTick: () => {
                const dT = this.scene.getEngine().getDeltaTime();
                fadeIn += dT;
                const currAmt = Scalar.SmoothStep(0, 1, fadeIn / fadeTime);
                this.menuContainer.alpha = currAmt;
            },
            onEnded: () => {
                this.selectedItemIndex = 0;
            },
        });
        return timer;
    }

    private onMenuLeave(duration: number, onEndedAction = () => {}) {
        let fadeOut = 0;
        const fadeTime = duration || 1500;

        // this.menuContainer.isVisible = true;

        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this.scene.onBeforeRenderObservable,
            onTick: () => {
                const dT = this.scene.getEngine().getDeltaTime();
                fadeOut += dT;
                const currAmt = Scalar.SmoothStep(1, 0, fadeOut / fadeTime);
                this.menuContainer.alpha = currAmt;
                this.menuGrid.alpha = currAmt;
            },
            onEnded: () => {
                this.menuContainer.alpha = 0;
                this.menuContainer.isVisible = false;
                if (onEndedAction) onEndedAction();
            },
        });
        return timer;
    }

    private setupUi() {
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        gui.renderAtIdealSize = true;
        this.guiMenu = gui;

        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 5;
        menuContainer.cornerRadius = 13;
        menuContainer.alpha = 0;

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
        // TODO: fix in Grid in pillar-of-babylonjs
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
        const playBtnOptions: MenuItemOptions = {
            name: "btPlay",
            title: "Play",
            background: "red",
            color: "white",
            onInvoked: () => console.log("Play button clicked"),
        };

        const playButton = this.createMenuItem(playBtnOptions);

        const exitBtnOptions: MenuItemOptions = {
            name: "btExit",
            title: "Exit",
            background: "white",
            color: "black",
            onInvoked: () => this.onMenuLeave(1000),
        };

        const exitButton = this.createMenuItem(exitBtnOptions);
        this.menuGrid.addControl(playButton, this.menuGrid.children.length, 1);
        this.menuGrid.addControl(exitButton, 1, 1);
    }

    private createMenuItem(opts: MenuItemOptions) {
        const finalConfig = {
            name: "defaultBtnName",
            title: "Default Title",
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

    private createSelectorIcon() {
        const selectorIcon = new Image("selectorIcon", selectionIcon);
        selectorIcon.width = "160px";
        selectorIcon.height = "60px";
        selectorIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        selectorIcon.shadowOffsetX = 5;
        selectorIcon.shadowOffsetY = 3;
        selectorIcon.isVisible = false;

        this.menuGrid.addControl(selectorIcon, 1, 0);

        this.selectorIcon = selectorIcon;

        this.selectorAnimationFrame = 0;
        this.scene.onBeforeRenderObservable.add(() =>
            this.selectorIconAnimation()
        );
    }

    private selectorIconAnimation() {
        const animTimeSeconds = Math.PI * 2;
        const dT = this.scene.getEngine().getDeltaTime() / 1000;
        this.selectorAnimationFrame = Scalar.Repeat(
            this.selectorAnimationFrame + dT * 5,
            animTimeSeconds * 10
        );

        this.selectorIcon.top =
            Math.sin(this.selectorAnimationFrame).toFixed(0) + "px";
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
