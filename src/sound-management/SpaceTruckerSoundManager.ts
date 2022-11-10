import soundFileMap, { Channels, SoundId } from '@/sound-management/spaceTruckerSoundMap';
import { Observable, Scene, Sound, SoundTrack } from '@babylonjs/core';

type RegisteredSounds = {
  [key in SoundId]?: Sound;
};

export default class SpaceTruckerSoundManager {
  private registeredSounds: RegisteredSounds;

  private channels: Channels;

  public onReadyObservable: Observable<SoundId[]>;

  public onSoundPlaybackEnded: Observable<string>;

  constructor(scene: Scene, ...soundIds: SoundId[]) {
    this.registeredSounds = {};
    this.onReadyObservable = new Observable();
    this.onSoundPlaybackEnded = new Observable();
    this.channels = {
      music: new SoundTrack(scene, { mainTrack: false, volume: 0.95 }),
      sfx: new SoundTrack(scene, { mainTrack: true, volume: 1 }),
      ui: new SoundTrack(scene, { mainTrack: false, volume: 0.78 }),
      ambient: new SoundTrack(scene, { mainTrack: false, volume: 0.65 }),
    };

    if (scene && scene.soundTracks?.length) {
      // this.channels.music = new SoundTrack(scene, { mainTrack: false, volume: 0.95 });
      // this.channels.sfx = new SoundTrack(scene, { mainTrack: true, volume: 1 });
      // this.channels.ui = new SoundTrack(scene, { mainTrack: false, volume: 0.78 });
      // this.channels.ambient = new SoundTrack(scene, { mainTrack: false, volume: 0.65 });

      this.channels.music = scene.soundTracks[0];
      this.channels.sfx = scene.soundTracks[1];
      this.channels.ui = scene.soundTracks[2];
      this.channels.ambient = scene.soundTracks[3];
    }

    const onReadyPromises: Promise<SoundId>[] = [];

    soundIds.forEach(soundId => {
      const soundFile = soundFileMap[soundId];
      const channel = this.channels[soundFileMap[soundId].channel] ?? scene.mainSoundTrack;

      if (!soundFile) {
        console.log('Sound not found in mapping file', soundId);
        return;
      }

      const prom = new Promise<SoundId>(resolve => {
        const sound = new Sound(
          soundId,
          soundFile.url,
          scene,
          () => {
            channel.addSound(this.registeredSounds[soundId]!);
            resolve(soundId);
          },
          {
            autoplay: false,
            loop: soundFile.loop,
            spatialSound: soundFile.channel === 'sfx',
            volume: soundFile.level ?? 1.0,
            playbackRate: soundFile.rate ?? 1.0,
          },
        );

        sound.onEndedObservable.add(endedSound => {
          this.onSoundPlaybackEnded.notifyObservers(endedSound.name);
        });

        this.registeredSounds[soundId] = sound;
      });

      onReadyPromises.push(prom);
    });

    Promise.all(onReadyPromises).then(readyIds => this.onReadyObservable.notifyObservers(readyIds));
  }

  getSound(id: SoundId) {
    return this.registeredSounds[id]!;
  }

  stopAll() {
    Object.values(this.registeredSounds).forEach(sound => sound.stop());
  }

  dispose() {
    this.stopAll();
    Object.values(this.registeredSounds).forEach(sound => sound.dispose());
  }
}
