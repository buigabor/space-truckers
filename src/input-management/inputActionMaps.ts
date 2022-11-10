import { Action } from '@/actions';

export type InputControlsMap = Record<string ,  Action | number>;

export const inputControlsMap = {
  /* Keyboard Mappings */
  W: 'MOVE_UP', w: 'MOVE_UP', 87: 'MOVE_UP', ArrowUp:"MOVE_UP",
  S: 'MOVE_DOWN', s: 'MOVE_DOWN', 83: 'MOVE_DOWN', ArrowDown:"MOVE_DOWN",
  A: 'MOVE_LEFT', a: 'MOVE_LEFT', 65: 'MOVE_LEFT', ArrowLeft: "MOVE_LEFT",
  D: 'MOVE_RIGHT', d: 'MOVE_RIGHT', 68: 'MOVE_RIGHT', ArrowRight: "MOVE_RIGHT",
  Q: 'ROTATE_LEFT', q: 'ROTATE_LEFT',
  E: 'ROTATE_RIGHT', e: 'ROTATE_RIGHT',
  P: 'PAUSE', p: 'PAUSE',
  Backspace: 'GO_BACK', Delete: 'GO_BACK', 46: 'GO_BACK', 8: 'GO_BACK',
  Enter: 'ACTIVATE', Return: 'ACTIVATE', 13: 'ACTIVATE', Space: 'ACTIVATE', 32: 'ACTIVATE', ' ': 'ACTIVATE',
  Shift: 'MOVE_IN',
  Control: 'MOVE_OUT',
  // ArrowUp: 'MOVE_UP',
  // ArrowDown: 'MOVE_DOWN',
  // ArrowLeft: 'ROTATE_LEFT',
  // ArrowRight: 'ROTATE_RIGHT',

  /* Mouse and Touch Mappings */
  PointerTap: 'ACTIVATE',

  /* Gamepad Mappings */
  button1: 'ACTIVATE', buttonStart: 'PAUSE',
  buttonBack: 'GO_BACK', button2: 'GO_BACK',
  dPadDown: 'MOVE_DOWN', lStickDown: 'MOVE_DOWN',
  dPadUp: 'MOVE_UP', lStickUp: 'MOVE_UP',
  dPadRight: 'MOVE_RIGHT', lStickRight: 'MOVE_RIGHT',
  dPadLeft: 'MOVE_LEFT', lStickLeft: 'MOVE_LEFT',
  rStickUp: 'ROTATE_UP',
  rStickDown: 'ROTATE_DOWN',
  rStickRight: 'ROTATE_RIGHT',
  rStickLeft: 'ROTATE_LEFT'
} as Record<string, Action>;

interface JoystickValue {
  x: number;
  y: number;
}

export function mapStickTranslationInputToActions(stickInput:JoystickValue, inputMap: InputControlsMap) {
  // NOTE: I have no idea if this is a reasonable threshold value, test with 5.0.0-alpha23+
  if (stickInput.x >= 0.05) {
      inputMap["lStickRight"] = stickInput.x;
  }
  else {
      delete inputMap["lStickRight"];
  }

  if (stickInput.x <= -0.05) {
      inputMap["lStickLeft"] = stickInput.x
  }
  else {
      delete inputMap["lStickLeft"];
  }
  if (stickInput.y >= 0.05) {
      inputMap["lStickUp"] = stickInput.y;
  }
  else {
      delete inputMap["lStickUp"];
  }

  if (stickInput.y <= -0.05) {
      inputMap["lStickDown"] = stickInput.y;
  }
  else {
      delete inputMap["lStickDown"];
  }

}

export function mapRotationInputToActions(stickInput:JoystickValue, inputMap: InputControlsMap) {
  // NOTE: I have no idea if this is a reasonable threshold value, test with 5.0.0-alpha23+
  if (stickInput.x >= 0.05) {
      inputMap["rStickRight"] = stickInput.x;
  }
  else {
      delete inputMap["rStickRight"];
  }

  if (stickInput.x <= -0.05) {
      inputMap["rStickLeft"] = stickInput.x
  }
  else {
      delete inputMap["rStickLeft"];
  }
  if (stickInput.y >= 0.05) {
      inputMap["rStickUp"] = stickInput.y;
  }
  else {
      delete inputMap["rStickUp"];
  }

  if (stickInput.y <= -0.05) {
      inputMap["rStickDown"] = stickInput.y;
  }
  else {
      delete inputMap["rStickDown"];
  }
}


export function normalizeJoystickInputs(stick?: JoystickValue) {
  const stickMoveSensitivity = 40; // see above link
  const stickValues:JoystickValue = {
    x: 0,
    y: 0
  };

  if (stick) {
      const normalizedLX = stick.x / stickMoveSensitivity;
      const normalizedLY = stick.y / stickMoveSensitivity;
      stickValues.x = Math.abs(normalizedLX) > 0.005 ? 0 + normalizedLX : 0;
      stickValues.y = Math.abs(normalizedLY) > 0.005 ? 0 + normalizedLY : 0;
  }

  return stickValues;
}