import { Vector2 } from './types';

export class InputManager {
  private keys: Set<string> = new Set();
  private touchVector: Vector2 = { x: 0, y: 0 };
  private dashRequested: boolean = false;
  private pauseRequested: boolean = false;

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys.add(key);

    if (e.code === 'Space' || key === 'shift') {
      this.dashRequested = true;
    }
    if (e.code === 'Escape' || key === 'p') {
      this.pauseRequested = true;
    }

    // Prevent default scroll behaviors for game keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(e.code.toLowerCase()) ||
        ['w', 'a', 's', 'd', ' '].includes(key)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  public setTouchVector(x: number, y: number) {
    this.touchVector.x = Math.max(-1, Math.min(1, x));
    this.touchVector.y = Math.max(-1, Math.min(1, y));
  }

  public triggerTouchDash() {
    this.dashRequested = true;
  }

  public pollDash(): boolean {
    if (this.dashRequested) {
      this.dashRequested = false;
      return true;
    }
    return false;
  }

  public pollPause(): boolean {
    if (this.pauseRequested) {
      this.pauseRequested = false;
      return true;
    }
    return false;
  }

  public getMovementVector(): Vector2 {
    let x = 0;
    let y = 0;

    // Keyboard checks
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;

    // Normalize keyboard vector if non-zero
    const kbMag = Math.hypot(x, y);
    if (kbMag > 0) {
      x /= kbMag;
      y /= kbMag;
    }

    // Combine with touch if touch is active
    const touchMag = Math.hypot(this.touchVector.x, this.touchVector.y);
    if (touchMag > 0.05) {
      x = this.touchVector.x;
      y = this.touchVector.y;
    }

    return { x, y };
  }
}
