import { Action } from '@/actions';
import babylonjsTexture from '@/assets/textures/babylonjs-logo.png';
import poweredByTexture from '@/assets/textures/powered-by.png';
import rigTexture from '@/assets/textures/space-trucker-and-rig.png';
import InjectInspector from '@/decorators/InjectInspector.decorator';
import SpaceTruckerInputManager from '@/input-management/SpaceTruckerInputManager';
import { SpaceTruckerInputProcessor } from '@/input-management/SpaceTruckerInputProcessor';
import logger from '@/logger';
import { Screen } from '@/screens/Screen';
import CutSceneSegment from '@/screens/splash/CutSceneSegment';
import SpaceTruckerSoundManager from '@/sound-management/SpaceTruckerSoundManager';
import { SoundId } from '@/sound-management/spaceTruckerSoundMap';
import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Observable,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, TextWrapping } from '@babylonjs/gui';

const animationFps = 30;
const flipAnimation = new Animation(
  'flip',
  'rotation.x',
  animationFps,
  Animation.ANIMATIONTYPE_FLOAT,
  Animation.ANIMATIONLOOPMODE_CONSTANT,
  true,
);
const fadeAnimation = new Animation(
  'entranceAndExitFade',
  'visibility',
  animationFps,
  Animation.ANIMATIONTYPE_FLOAT,
  Animation.ANIMATIONLOOPMODE_CONSTANT,
  true,
);
const scaleAnimation = new Animation(
  'scaleTarget',
  'scaling',
  animationFps,
  Animation.ANIMATIONTYPE_VECTOR3,
  Animation.ANIMATIONLOOPMODE_CYCLE,
  true,
);

const actionList = [{ action: Action.ACTIVATE, shouldBounce: () => false }];

@InjectInspector
export default class SplashScreen implements Screen {
  private currentSegment!: CutSceneSegment | null;

  private poweredBySegment: CutSceneSegment;

  private babylonSegment!: CutSceneSegment;

  private callToActionSegment!: CutSceneSegment;

  private light!: HemisphericLight;

  private billboard: Mesh;

  private ctaBlock!: TextBlock;

  private audioManager: SpaceTruckerSoundManager;

  public name: string;

  public skipRequested: boolean;

  public onReadyObservable: Observable<boolean>;

  public scene: Scene;

  public actionProcessor: SpaceTruckerInputProcessor;

  get music() {
    return this.audioManager.getSound(SoundId.TITLE);
  }

  constructor(engine: Engine, inputManager: SpaceTruckerInputManager) {
    this.name = 'SplashScreen';
    this.scene = new Scene(engine);
    this.onReadyObservable = new Observable();
    this.billboard = this.buildBillboard();
    this.skipRequested = false;

    this.setupEnvironment();

    this.audioManager = new SpaceTruckerSoundManager(this.scene, SoundId.TITLE);

    this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, actionList);

    this.poweredBySegment = this.buildPoweredBySegment();

    this.poweredBySegment.onEnd.addOnce(() => {
      this.prepareForBabylonSegment();
      this.currentSegment = this.babylonSegment = this.buildBabylonSegment();

      this.babylonSegment.onEnd.addOnce(() => {
        this.prepareForCallToActionSegment();
        this.currentSegment = this.callToActionSegment = this.buildCallToActionSegment();

        this.callToActionSegment.onEnd.addOnce(() => {
          this.ctaBlock.isVisible = true;
        });
      });
    });

    this.audioManager.onReadyObservable.addOnce(() => this.onReadyObservable.notifyObservers(true));
  }

  run() {
    this.music.setVolume(0.1);
    this.music.play();
    this.currentSegment = this.poweredBySegment;
    this.music.setVolume(1, 60);
    this.currentSegment.start();
  }

  update() {
    let prior,
      curr = this.currentSegment;
    this.actionProcessor.update();
    if (this.skipRequested) {
      this?.currentSegment?.stop();
      this.currentSegment = null;
      return;
    }
    curr = this.currentSegment;

    if (prior !== curr) {
      this.currentSegment?.start();
    }
  }

  private setupEnvironment() {
    this.scene.clearColor = Color4.FromColor3(Color3.Black());

    new ArcRotateCamera('camera', 0, Math.PI / 2, 5, Vector3.Zero(), this.scene);

    this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    this.light.groundColor = Color3.White();
    this.light.intensity = 0.85;
  }

  private buildBillboard() {
    const billboard = MeshBuilder.CreatePlane(
      'billboard',
      {
        width: 5.5,
        height: 1.75,
      },
      this.scene,
    );
    billboard.rotation.z = Math.PI;
    billboard.rotation.x = Math.PI;
    billboard.rotation.y = Math.PI / 2;
    billboard.visibility = 0;

    const billMat = new StandardMaterial('stdMat', this.scene);
    billMat.diffuseTexture = new Texture(poweredByTexture, this.scene);
    billboard.material = billMat;

    return billboard;
  }

  private buildPoweredBySegment() {
    const fadeKeys = [
      { frame: 0, value: 0 },
      { frame: 3 * animationFps, value: 1 },
    ];
    fadeAnimation.setKeys(fadeKeys);

    const flipKeys = [
      { frame: 0, value: Math.PI },
      { frame: 3 * animationFps, value: Math.PI },
      { frame: 4 * animationFps, value: Math.PI / 2 },
    ];
    flipAnimation.setKeys(flipKeys);

    const seg0 = new CutSceneSegment(this.billboard, this.scene, fadeAnimation, flipAnimation);
    return seg0;
  }

  prepareForBabylonSegment() {
    this.light.direction = new Vector3(0, -1, 0);

    const billMat = this.billboard.material as StandardMaterial;
    billMat.diffuseTexture = new Texture(babylonjsTexture, this.scene);

    this.billboard.rotation.x = -Math.PI / 2.5;
    this.billboard.visibility = 1;
  }

  buildBabylonSegment() {
    const fadeKeys = [
      { frame: 0, value: 1 },
      { frame: 4 * animationFps, value: 1 },
      { frame: 5 * animationFps, value: 0 },
    ];
    fadeAnimation.setKeys(fadeKeys);

    const flipKeys = [
      { frame: 0, value: -Math.PI / 2.5 },
      { frame: 1 * animationFps, value: -Math.PI / 2 },
      { frame: 3 * animationFps, value: -Math.PI },
    ];
    flipAnimation.setKeys(flipKeys);

    const seg1 = new CutSceneSegment(this.billboard, this.scene, fadeAnimation, flipAnimation);
    return seg1;
  }

  prepareForCallToActionSegment() {
    this.billboard.visibility = 0;
    const billMat = this.billboard.material as StandardMaterial;
    billMat.diffuseTexture = new Texture(rigTexture, this.scene);

    const callToActionTexture = AdvancedDynamicTexture.CreateFullscreenUI('splashGui');
    const ctaBlock = (this.ctaBlock = new TextBlock(
      'ctaBlock',
      'Press any key or tap the screen to continue...',
    ));
    ctaBlock.textWrapping = TextWrapping.WordWrap;
    ctaBlock.color = 'white';
    ctaBlock.fontSize = '18pt';
    ctaBlock.verticalAlignment = ctaBlock.textVerticalAlignment =
      TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    ctaBlock.paddingBottom = '12%';
    ctaBlock.isVisible = false;
    callToActionTexture.addControl(ctaBlock);
  }

  buildCallToActionSegment() {
    const start = 0;
    const enterTime = 1.0;
    const exitTime = enterTime + 1.0;
    const end = exitTime + 1.0;
    const entranceFrame = enterTime * animationFps;
    const beginExitFrame = exitTime * animationFps;
    const endFrame = end * animationFps;
    const keys = [
      { frame: start, value: 0 },
      { frame: entranceFrame, value: 1 },
      { frame: beginExitFrame, value: 0.998 },
      { frame: endFrame, value: 1 },
    ];

    const startVector = new Vector3(1, 1, 1);
    const scaleKeys = [
      { frame: start, value: startVector },
      { frame: entranceFrame, value: new Vector3(1.25, 1, 1.25) },
      { frame: beginExitFrame, value: new Vector3(1.5, 1, 1.5) },
      { frame: endFrame, value: new Vector3(1, 1, 1) },
    ];

    fadeAnimation.setKeys(keys);
    scaleAnimation.setKeys(scaleKeys);

    const seg = new CutSceneSegment(this.billboard, this.scene, fadeAnimation, scaleAnimation);
    return seg;
  }

  /********************************** SCREEN ACTIONS **********************************************/

  ACTIVATE(priorState?: boolean) {
    if (!this.skipRequested && !priorState) {
      logger.logInfo('Key press detected. Skipping cut scene.');
      this.skipRequested = true;
      this.music?.stop();
      return true;
    }

    return false;
  }
}
