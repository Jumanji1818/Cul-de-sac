/**
 * Unified Shared Input System for Cul-de-Sac Chaos
 * Bridges Desktop Keyboard, Gamepads, and Mobile Multi-Touch.
 */

export interface PlayerActionState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  isSprinting: boolean;
  jumpJustPressed: boolean;
  kickJustPressed: boolean;
  kickHeld: boolean;
  sprayHeld: boolean;
  highFiveJustPressed: boolean;
  gadgetJustPressed: boolean;
  cycleGadgetJustPressed: boolean;
  commandJustPressed: boolean;
  cameraSnapJustPressed?: boolean;
  cameraToggleJustPressed?: boolean;
}

export class InputSystem {
  // Desktop Keys
  private keysHeld: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private inputBuffer: Map<string, number> = new Map(); // Key -> remaining buffer seconds

  // Touch Controls State
  private touchMoveX: number = 0;
  private touchMoveY: number = 0;
  private touchSprinting: boolean = false;
  private touchJumpJustPressed: boolean = false;
  private touchKickJustPressed: boolean = false;
  private touchKickHeld: boolean = false;
  private touchSprayHeld: boolean = false;
  private touchHighFiveJustPressed: boolean = false;
  private touchGadgetJustPressed: boolean = false;
  private touchCommandJustPressed: boolean = false;
  private touchCycleGadgetJustPressed: boolean = false;
  public touchCamDx: number = 0;
  public touchCamDy: number = 0;

  // Sensitivity
  public joystickSensitivity: number = 1.0;

  constructor() {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: true });
    window.addEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Suppress default scrolling for game keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }

    if (!this.keysHeld.has(e.code)) {
      this.keysJustPressed.add(e.code);
      this.inputBuffer.set(e.code, 0.15); // 150ms buffer
    }
    this.keysHeld.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld.delete(e.code);
  };

  private handleBlur = () => {
    this.clearAll();
  };

  public clearAll() {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
    this.inputBuffer.clear();
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.touchSprinting = false;
    this.touchJumpJustPressed = false;
    this.touchKickJustPressed = false;
    this.touchKickHeld = false;
    this.touchSprayHeld = false;
    this.touchHighFiveJustPressed = false;
    this.touchGadgetJustPressed = false;
    this.touchCommandJustPressed = false;
    this.touchCycleGadgetJustPressed = false;
    this.touchCamDx = 0;
    this.touchCamDy = 0;
  }

  // --- Mobile Touch Bridge Methods ---
  public setJoystickMove(x: number, y: number) {
    const rawLen = Math.sqrt(x * x + y * y);
    if (rawLen === 0) {
      this.touchMoveX = 0;
      this.touchMoveY = 0;
      return;
    }
    // Clamped and normalized with sensitivity
    const clampedLen = Math.min(1.0, rawLen * this.joystickSensitivity);
    this.touchMoveX = (x / rawLen) * clampedLen;
    this.touchMoveY = (y / rawLen) * clampedLen;
  }

  public setTouchSprint(sprinting: boolean) {
    this.touchSprinting = sprinting;
  }

  public triggerTouchJump() {
    this.touchJumpJustPressed = true;
    this.inputBuffer.set('TOUCH_JUMP', 0.15);
  }

  public triggerTouchKick(pressed: boolean) {
    if (pressed) {
      this.touchKickJustPressed = true;
      this.touchKickHeld = true;
      this.inputBuffer.set('TOUCH_KICK', 0.15);
    } else {
      this.touchKickHeld = false;
    }
  }

  public addTouchCameraDelta(dx: number, dy: number) {
    this.touchCamDx += dx;
    this.touchCamDy += dy;
  }

  public consumeTouchCameraDelta(): { dx: number; dy: number } {
    const res = { dx: this.touchCamDx, dy: this.touchCamDy };
    this.touchCamDx = 0;
    this.touchCamDy = 0;
    return res;
  }

  public triggerTouchSpray(pressed: boolean) {
    this.touchSprayHeld = pressed;
  }

  public triggerTouchHighFive() {
    this.touchHighFiveJustPressed = true;
  }

  public triggerTouchGadget() {
    this.touchGadgetJustPressed = true;
  }

  public triggerTouchCommand() {
    this.touchCommandJustPressed = true;
  }

  public triggerTouchCycleGadget() {
    this.touchCycleGadgetJustPressed = true;
  }

  // --- Frame Updates ---
  public update(dt: number) {
    // Decrement buffered inputs
    for (const [key, timer] of this.inputBuffer.entries()) {
      if (timer <= dt) {
        this.inputBuffer.delete(key);
      } else {
        this.inputBuffer.set(key, timer - dt);
      }
    }
  }

  public endFrame() {
    this.keysJustPressed.clear();
    this.touchJumpJustPressed = false;
    this.touchKickJustPressed = false;
    this.touchHighFiveJustPressed = false;
    this.touchGadgetJustPressed = false;
    this.touchCommandJustPressed = false;
    this.touchCycleGadgetJustPressed = false;
  }

  // --- Get Player 1 Actions (Keyboard WASD or Touchscreen) ---
  public getP1State(): PlayerActionState {
    let kbX = 0;
    let kbY = 0;

    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) kbY -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) kbY += 1;
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) kbX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) kbX += 1;

    // Normalize diagonal keyboard movement
    if (kbX !== 0 && kbY !== 0) {
      kbX *= Math.SQRT1_2;
    }

    // Combine keyboard or touch (whichever is active)
    let moveX = kbX;
    let moveY = kbY;

    if (this.touchMoveX !== 0 || this.touchMoveY !== 0) {
      moveX = this.touchMoveX;
      moveY = this.touchMoveY;
    }

    const isSprinting =
      this.keysHeld.has('ShiftLeft') ||
      this.keysHeld.has('ShiftRight') ||
      this.touchSprinting;

    const jumpJustPressed =
      this.keysJustPressed.has('Space') ||
      this.keysJustPressed.has('KeyJ') ||
      this.inputBuffer.has('Space') ||
      this.inputBuffer.has('KeyJ') ||
      this.touchJumpJustPressed ||
      this.inputBuffer.has('TOUCH_JUMP');

    const kickJustPressed =
      this.keysJustPressed.has('KeyF') ||
      this.keysJustPressed.has('KeyE') ||
      this.inputBuffer.has('KeyF') ||
      this.inputBuffer.has('KeyE') ||
      this.touchKickJustPressed ||
      this.inputBuffer.has('TOUCH_KICK');

    const kickHeld =
      this.keysHeld.has('KeyF') ||
      this.keysHeld.has('KeyE') ||
      this.touchKickHeld;

    const sprayHeld =
      this.keysHeld.has('KeyR') ||
      this.keysHeld.has('KeyF') ||
      this.touchSprayHeld;

    const highFiveJustPressed =
      this.keysJustPressed.has('KeyH') ||
      this.keysJustPressed.has('KeyE') ||
      this.inputBuffer.has('KeyH') ||
      this.inputBuffer.has('KeyE') ||
      this.touchHighFiveJustPressed;

    const gadgetJustPressed =
      this.keysJustPressed.has('KeyG') ||
      this.keysJustPressed.has('Digit1') ||
      this.keysJustPressed.has('Digit2') ||
      this.keysJustPressed.has('Digit3') ||
      this.touchGadgetJustPressed;

    const cycleGadgetJustPressed =
      this.keysJustPressed.has('Tab') ||
      this.touchCycleGadgetJustPressed;

    const commandJustPressed =
      this.keysJustPressed.has('KeyQ') ||
      this.touchCommandJustPressed;

    const cameraSnapJustPressed =
      this.keysJustPressed.has('KeyV') ||
      this.keysJustPressed.has('KeyC');

    const cameraToggleJustPressed =
      this.keysJustPressed.has('KeyZ');

    return {
      moveX,
      moveY,
      isSprinting,
      jumpJustPressed,
      kickJustPressed,
      kickHeld,
      sprayHeld,
      highFiveJustPressed,
      gadgetJustPressed,
      cycleGadgetJustPressed,
      commandJustPressed,
      cameraSnapJustPressed,
      cameraToggleJustPressed,
    };
  }

  // --- Get Player 2 Actions (Local Co-op via Arrow Keys / Numpad / Second Set) ---
  public getP2State(): PlayerActionState {
    let kbX = 0;
    let kbY = 0;

    if (this.keysHeld.has('ArrowUp') || this.keysHeld.has('KeyI')) kbY -= 1;
    if (this.keysHeld.has('ArrowDown') || this.keysHeld.has('KeyK')) kbY += 1;
    if (this.keysHeld.has('ArrowLeft') || this.keysHeld.has('KeyJ')) kbX -= 1;
    if (this.keysHeld.has('ArrowRight') || this.keysHeld.has('KeyL')) kbX += 1;

    if (kbX !== 0 && kbY !== 0) {
      kbX *= Math.SQRT1_2;
    }

    const isSprinting = this.keysHeld.has('ShiftRight') || this.keysHeld.has('Slash');

    const jumpJustPressed =
      this.keysJustPressed.has('ControlRight') ||
      this.keysJustPressed.has('Numpad0') ||
      this.inputBuffer.has('ControlRight');

    const kickJustPressed =
      this.keysJustPressed.has('Enter') ||
      this.keysJustPressed.has('Period') ||
      this.inputBuffer.has('Enter') ||
      this.inputBuffer.has('Period');

    const kickHeld = this.keysHeld.has('Enter') || this.keysHeld.has('Period');
    const sprayHeld = this.keysHeld.has('Enter') || this.keysHeld.has('Period') || this.keysHeld.has('KeyP');

    const highFiveJustPressed =
      this.keysJustPressed.has('Semicolon') ||
      this.keysJustPressed.has('KeyO') ||
      this.inputBuffer.has('Semicolon');

    return {
      moveX: kbX,
      moveY: kbY,
      isSprinting,
      jumpJustPressed,
      kickJustPressed,
      kickHeld,
      sprayHeld,
      highFiveJustPressed,
      gadgetJustPressed: false,
      cycleGadgetJustPressed: false,
      commandJustPressed: false,
    };
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.clearAll();
  }
}
