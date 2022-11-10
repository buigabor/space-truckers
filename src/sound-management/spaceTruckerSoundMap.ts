import { SoundTrack } from '@babylonjs/core';
import titleSongUrl from '../assets/music/space-trucker-title-theme.m4a';
import cruisingUrl from '../assets/music/space-truckers-cruising.m4a';
import backgroundMusicUrl from '../assets/music/space-truckers-overworld-theme.m4a';
import scoreSoundUrl from '../assets/sounds/cash-register-sound-effect.mp3';
import ambientNoise from '../assets/sounds/City_Amb_03.wav';
import uiWhooshSoundUrl from '../assets/sounds/med_whoosh_00.wav';
import uiErrorSoundUrl from '../assets/sounds/UIerror2.wav';
import uiClickSoundUrl from '../assets/sounds/UI_Clicks01.wav';
import uiSlideUrl from '../assets/sounds/UI_Misc03.wav';
import uiEncounterSoundUrl from '../assets/sounds/UI_Misc09.wav';

export interface Channels {
  music: SoundTrack;
  sfx: SoundTrack;
  ui: SoundTrack;
  ambient: SoundTrack;
}

interface SoundFile {
  url: string;
  channel: keyof Channels;
  loop?: boolean;
  level?: number;
  rate?: number;
}

export enum SoundId {
  TITLE = 'title',
  OVERWORLD = 'overworld',
  WHOOSH = 'whoosh',
  MENU_SLIDE = 'menu-slide',
  AMBIENT = 'ambient',
  CLICK = 'click',
  ERROR = 'error',
  ENCOUNTER = 'encounter',
  SCORING = 'scoring',
  CRUISING = 'cruising',
}

const soundFileMap = {
  [SoundId.TITLE]: { url: titleSongUrl, channel: 'music', loop: true },
  [SoundId.OVERWORLD]: { url: backgroundMusicUrl, channel: 'music', loop: true, level: 0.67 },
  [SoundId.WHOOSH]: { url: uiWhooshSoundUrl, channel: 'ui', loop: false },
  [SoundId.MENU_SLIDE]: { url: uiSlideUrl, channel: 'ui', loop: false },
  [SoundId.AMBIENT]: { url: ambientNoise, channel: 'music', loop: true },
  [SoundId.CLICK]: { url: uiClickSoundUrl, channel: 'ui', loop: false },
  [SoundId.ERROR]: { url: uiErrorSoundUrl, channel: 'ui', loop: false },
  [SoundId.ENCOUNTER]: { url: uiEncounterSoundUrl, channel: 'ui', loop: false },
  [SoundId.SCORING]: { url: scoreSoundUrl, channel: 'ui', loop: false, level: 0.55, rate: 1.65 },
  [SoundId.CRUISING]: { url: cruisingUrl, channel: 'music', loop: true, level: 0.7, rate: 1.0 },
};

type SoundFileMap = {
  [key in SoundId]: SoundFile;
};

export default soundFileMap as SoundFileMap;
