import { Vector2, ArenaBounds, TrailPoint, SkinConfig } from './types';
import { PLAYER_CONFIG } from './constants';
import { soundFX } from './SoundFX';
import { SKINS } from './Storage';

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = PLAYER_CONFIG.RADIUS;

  // Custom Skin
  public skin: SkinConfig = SKINS[0];

  // Dash & Energy state
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashDirection: Vector2 = { x: 1, y: 0 };
  public dashEnergy: number = 100;
  public maxEnergy: number = 100;

  // Visuals
  public trail: TrailPoint[] = [];
  private lastTrailTime: number = 0;
  public pulsePhase: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public setSkin(skin: SkinConfig) {
    this.skin = skin;
  }

  public reset(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashEnergy = 100;
    this.trail = [];
  }

  public update(
    dt: number,
    moveInput: Vector2,
    requestDash: boolean,
    bounds: ArenaBounds,
    externalForce?: Vector2
  ) {
    this.pulsePhase += dt * 4;

    // Apply external forces (e.g. gravity vortex)
    if (externalForce && !this.isDashing) {
      this.vx += externalForce.x * dt;
      this.vy += externalForce.y * dt;
    }

    // Energy recharge
    if (!this.isDashing && this.dashEnergy < this.maxEnergy) {
      this.dashEnergy = Math.min(
        this.maxEnergy,
        this.dashEnergy + PLAYER_CONFIG.ENERGY_RECHARGE_RATE * dt
      );
    }

    // Check if dash can be triggered
    if (requestDash && !this.isDashing && this.dashEnergy >= PLAYER_CONFIG.DASH_COST) {
      this.isDashing = true;
      this.dashTimer = PLAYER_CONFIG.DASH_DURATION;
      this.dashEnergy -= PLAYER_CONFIG.DASH_COST;

      // Determine dash direction (either input direction or last velocity direction)
      const inputMag = Math.hypot(moveInput.x, moveInput.y);
      if (inputMag > 0.1) {
        this.dashDirection = { x: moveInput.x / inputMag, y: moveInput.y / inputMag };
      } else {
        const velMag = Math.hypot(this.vx, this.vy);
        if (velMag > 10) {
          this.dashDirection = { x: this.vx / velMag, y: this.vy / velMag };
        } else {
          this.dashDirection = { x: 1, y: 0 };
        }
      }

      this.vx = this.dashDirection.x * PLAYER_CONFIG.DASH_SPEED;
      this.vy = this.dashDirection.y * PLAYER_CONFIG.DASH_SPEED;
      soundFX.playDash();
    }

    // Handle dash in progress
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        // Dampen velocity out of dash
        this.vx *= 0.45;
        this.vy *= 0.45;
      }
    } else {
      // Standard physics movement
      const inputMag = Math.hypot(moveInput.x, moveInput.y);
      if (inputMag > 0.05) {
        // Accelerate toward target velocity
        const targetVx = moveInput.x * PLAYER_CONFIG.BASE_SPEED;
        const targetVy = moveInput.y * PLAYER_CONFIG.BASE_SPEED;

        this.vx += (targetVx - this.vx) * Math.min(1, 14 * dt);
        this.vy += (targetVy - this.vy) * Math.min(1, 14 * dt);
      } else {
        // Apply friction damping
        this.vx *= Math.pow(PLAYER_CONFIG.FRICTION, dt * 60);
        this.vy *= Math.pow(PLAYER_CONFIG.FRICTION, dt * 60);
      }
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Arena boundary collision with slight elasticity
    let bumped = false;
    const minX = bounds.x + this.radius;
    const maxX = bounds.x + bounds.width - this.radius;
    const minY = bounds.y + this.radius;
    const maxY = bounds.y + bounds.height - this.radius;

    if (this.x < minX) {
      this.x = minX;
      this.vx = -this.vx * 0.4;
      bumped = true;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx = -this.vx * 0.4;
      bumped = true;
    }

    if (this.y < minY) {
      this.y = minY;
      this.vy = -this.vy * 0.4;
      bumped = true;
    } else if (this.y > maxY) {
      this.y = maxY;
      this.vy = -this.vy * 0.4;
      bumped = true;
    }

    if (bumped && (Math.abs(this.vx) > 60 || Math.abs(this.vy) > 60)) {
      soundFX.playWallBump();
    }

    // Update Trail points
    this.lastTrailTime += dt;
    if (this.lastTrailTime > 0.02) {
      this.lastTrailTime = 0;
      this.trail.unshift({
        x: this.x,
        y: this.y,
        alpha: this.isDashing ? 0.9 : 0.5,
        radius: this.isDashing ? this.radius * 1.1 : this.radius * 0.9,
      });

      if (this.trail.length > (this.isDashing ? PLAYER_CONFIG.MAX_TRAIL_LENGTH * 1.5 : PLAYER_CONFIG.MAX_TRAIL_LENGTH)) {
        this.trail.pop();
      }
    }

    // Fade trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha -= dt * 3.5;
      this.trail[i].radius = Math.max(2, this.trail[i].radius - dt * 10);
    }
    this.trail = this.trail.filter((p) => p.alpha > 0.05);
  }

  public render(ctx: CanvasRenderingContext2D) {
    // 1. Render Trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const pt = this.trail[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isDashing
        ? `rgba(255, 255, 255, ${pt.alpha})`
        : this.skin.glowColor.replace('0.6', `${pt.alpha * 0.7}`);
      ctx.shadowColor = this.skin.primaryColor;
      ctx.shadowBlur = this.isDashing ? 14 : 6;
      ctx.fill();
      ctx.restore();
    }

    // 2. Render Outer Glow & Shield Ring
    ctx.save();
    ctx.beginPath();
    const glowRadius = this.radius + 6 + Math.sin(this.pulsePhase) * 2;
    ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.isDashing
      ? 'rgba(255, 255, 255, 0.35)'
      : this.skin.glowColor.replace('0.6', '0.22');
    ctx.fill();

    // 3. Render Player Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isDashing ? '#ffffff' : this.skin.primaryColor;
    ctx.shadowColor = this.isDashing ? '#ffffff' : this.skin.glowColor;
    ctx.shadowBlur = this.isDashing ? 20 : 12;
    ctx.fill();

    // 4. Direction indicator eye/pip
    const velMag = Math.hypot(this.vx, this.vy);
    const dirX = velMag > 5 ? this.vx / velMag : this.dashDirection.x;
    const dirY = velMag > 5 ? this.vy / velMag : this.dashDirection.y;

    ctx.beginPath();
    ctx.arc(this.x + dirX * 5, this.y + dirY * 5, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = this.isDashing ? this.skin.primaryColor : this.skin.secondaryColor;
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.restore();
  }
}
