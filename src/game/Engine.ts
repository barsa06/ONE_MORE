import { ArenaBounds, GameState, GameOverData, EventStatus, Vector2 } from './types';
import { ARENA_CONFIG } from './constants';
import { Player } from './Player';
import { InputManager } from './Input';
import { CollectibleManager } from './Collectibles';
import { EnemyManager } from './Enemies';
import { ParticleSystem } from './Particles';
import { EventManager } from './EventManager';
import { soundFX } from './SoundFX';
import { storage, SKINS } from './Storage';

export interface EngineCallbacks {
  onStateChange: (state: GameState) => void;
  onStatsUpdate: (stats: {
    dashEnergy: number;
    fps: number;
    speed: number;
    score: number;
    bestScore: number;
    multiplier: number;
    multiplierProgress: number; // 0 to 1
    survivalTime: number;
    eventStatus: EventStatus;
  }) => void;
  onGameOver: (data: GameOverData) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  // Game Systems
  public input: InputManager;
  public player: Player;
  public collectibles: CollectibleManager;
  public enemies: EnemyManager;
  public particles: ParticleSystem;
  public events: EventManager;

  public state: GameState = 'PLAYING';
  private callbacks: EngineCallbacks;

  // Arena Dimensions
  public baseArena: ArenaBounds = {
    x: 0,
    y: 0,
    width: ARENA_CONFIG.DEFAULT_WIDTH,
    height: ARENA_CONFIG.DEFAULT_HEIGHT,
  };
  public arena: ArenaBounds = { ...this.baseArena };

  // Score & Gameplay Metrics
  public score: number = 0;
  public survivalTime: number = 0;
  public multiplier: number = 1.0;
  public comboTimer: number = 0;
  public readonly MAX_COMBO_TIME: number = 2.5;

  public sparksCollected: number = 0;
  public prismsCollected: number = 0;
  public grazesCount: number = 0;

  // Graze cooldown tracker per enemy id
  private grazedEnemies: Map<number, number> = new Map();

  // Screen shake
  private screenShakeTime: number = 0;
  private screenShakeMagnitude: number = 0;

  // Metrics
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFps: number = 60;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not retrieve 2D context');
    this.ctx = ctx;
    this.callbacks = callbacks;

    this.input = new InputManager();
    this.collectibles = new CollectibleManager();
    this.enemies = new EnemyManager();
    this.particles = new ParticleSystem();
    this.events = new EventManager();

    // Position player in center of default arena
    const centerX = this.arena.width / 2;
    const centerY = this.arena.height / 2;
    this.player = new Player(centerX, centerY);

    const savedSettings = storage.getSettings();
    const curSkin = SKINS.find((s) => s.id === savedSettings.selectedSkin) || SKINS[0];
    this.player.setSkin(curSkin);

    this.handleResize();
  }

  public applySkin(skinId: string) {
    const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];
    this.player.setSkin(skin);
  }

  public handleResize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);

    const padding = 20;
    const availWidth = rect.width - padding * 2;
    const availHeight = rect.height - padding * 2;

    const targetW = Math.min(availWidth, 960);
    const targetH = Math.min(availHeight, 680);

    this.baseArena = {
      x: (rect.width - targetW) / 2,
      y: (rect.height - targetH) / 2,
      width: targetW,
      height: targetH,
    };
    this.arena = this.events ? this.events.getAdjustedArena(this.baseArena) : { ...this.baseArena };
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public destroy() {
    this.stop();
    this.input.destroy();
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      this.lastTime = performance.now();
    }
  }

  public skipEventWarning() {
    this.events.skipWarning(this.baseArena);
  }

  public resetGame() {
    this.score = 0;
    this.survivalTime = 0;
    this.multiplier = 1.0;
    this.comboTimer = 0;
    this.sparksCollected = 0;
    this.prismsCollected = 0;
    this.grazesCount = 0;
    this.grazedEnemies.clear();
    this.screenShakeTime = 0;

    this.events.reset(this.baseArena);
    this.arena = { ...this.baseArena };

    this.player.reset(
      this.arena.x + this.arena.width / 2,
      this.arena.y + this.arena.height / 2
    );
    this.collectibles.reset();
    this.enemies.reset();
    this.particles.reset();

    this.setState('PLAYING');
    this.lastTime = performance.now();
  }

  private triggerScreenShake(magnitude: number, duration: number) {
    if (!storage.getSettings().screenShake) return;
    this.screenShakeMagnitude = magnitude;
    this.screenShakeTime = duration;
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const deltaMs = currentTime - this.lastTime;
    this.lastTime = currentTime;
    const dt = Math.min(deltaMs / 1000, 0.05);

    if (this.input.pollPause()) {
      this.togglePause();
    }

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    // Stats broadcast
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 100) {
      this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      const currentSpeed = Math.round(Math.hypot(this.player.vx, this.player.vy));
      const multProgress = Math.max(0, this.comboTimer / this.MAX_COMBO_TIME);

      this.callbacks.onStatsUpdate({
        dashEnergy: Math.round(this.player.dashEnergy),
        fps: this.currentFps,
        speed: currentSpeed,
        score: Math.floor(this.score),
        bestScore: storage.getHighScore(),
        multiplier: Number(this.multiplier.toFixed(1)),
        multiplierProgress: multProgress,
        survivalTime: Math.floor(this.survivalTime),
        eventStatus: this.events.getStatus(),
      });
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 0. Update Dynamic Events System
    this.events.update(dt, this.baseArena);

    // GAMEWORLD FREEZE DURING EVENT WARNING TELEGRAPH:
    // The entire game world (player, enemies, collectibles, score timers, combo decay)
    // freezes in place while the 5-second tactical countdown briefing displays!
    if (this.events.isWarningActive()) {
      return;
    }

    this.arena = this.events.getAdjustedArena(this.baseArena);

    const isSpeedSurge = this.events.activeEvent?.type === 'SPEED_SURGE' && !this.events.getStatus().isWarning;
    const enemySpeedMult = isSpeedSurge ? 1.35 : 1.0;
    const scoreSurgeMult = isSpeedSurge ? 2.0 : 1.0;

    // 1. Time and Score progression
    this.survivalTime += dt;
    this.score += 100 * dt * this.multiplier * scoreSurgeMult;

    // 2. Multiplier decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.multiplier = 1.0;
      }
    }

    // 3. Screen shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    // Event modifier: Gravity vortex force
    let vortexForce: Vector2 | undefined;
    if (this.events.activeEvent?.type === 'GRAVITY_VORTEX' && !this.events.getStatus().isWarning) {
      const cx = this.arena.x + this.arena.width / 2;
      const cy = this.arena.y + this.arena.height / 2;
      const dx = cx - this.player.x;
      const dy = cy - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 15) {
        const pull = Math.min(180, (260 / Math.max(60, dist)) * 85);
        vortexForce = { x: (dx / dist) * pull, y: (dy / dist) * pull };
      }
    }

    // Event modifier: Sanctuary safe zone
    let safeZoneParam: { pos: Vector2; radius: number } | null = null;
    if (this.events.activeEvent?.type === 'SAFE_ZONE' && !this.events.getStatus().isWarning) {
      safeZoneParam = {
        pos: this.events.safeZonePos,
        radius: this.events.safeZoneRadius,
      };
      const pDist = Math.hypot(
        this.player.x - this.events.safeZonePos.x,
        this.player.y - this.events.safeZonePos.y
      );
      if (pDist < this.events.safeZoneRadius) {
        // Player inside sanctuary dome: bonus score & rapid dash recharge
        this.score += 200 * dt;
        this.player.dashEnergy = Math.min(
          this.player.maxEnergy,
          this.player.dashEnergy + 25 * dt
        );
        if (Math.random() < 0.25) {
          this.particles.spawnBurst(
            this.player.x + (Math.random() - 0.5) * 16,
            this.player.y + (Math.random() - 0.5) * 16,
            '#34d399',
            1,
            30
          );
        }
      }
    }

    // 4. Update Player with potential vortex force and clamped arena
    const moveInput = this.input.getMovementVector();
    const requestDash = this.input.pollDash();
    this.player.update(dt, moveInput, requestDash, this.arena, vortexForce);

    // 5. Update Collectibles
    this.collectibles.update(dt, this.arena, this.player.x, this.player.y, this.player.isDashing);

    // 6. Update Enemies with speed multiplier and sanctuary repulsion
    this.enemies.update(
      dt,
      this.arena,
      { x: this.player.x, y: this.player.y },
      this.survivalTime,
      enemySpeedMult,
      safeZoneParam
    );

    // 7. Update Particles
    this.particles.update(dt);

    // 8. Collectible Pickups Collision
    for (let i = this.collectibles.items.length - 1; i >= 0; i--) {
      const item = this.collectibles.items[i];
      const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);

      if (dist < this.player.radius + item.radius) {
        if (item.type === 'SPARK') {
          this.sparksCollected++;
          const gained = Math.round(item.baseValue * this.multiplier * scoreSurgeMult);
          this.score += gained;
          this.multiplier = Math.min(10.0, this.multiplier + 0.1);
          this.comboTimer = this.MAX_COMBO_TIME;

          // Sound tone steps with multiplier
          const noteIndex = Math.min(7, Math.floor((this.multiplier - 1) * 2));
          soundFX.playCollectSpark(noteIndex);

          this.particles.spawnBurst(item.x, item.y, '#fbbf24', 9, 140);
          this.particles.spawnText(`+${gained}`, item.x, item.y - 8, '#fbbf24');
        } else if (item.type === 'PRISM') {
          this.prismsCollected++;
          const gained = Math.round(item.baseValue * this.multiplier * scoreSurgeMult);
          this.score += gained;
          this.multiplier = Math.min(10.0, this.multiplier + 0.5);
          this.comboTimer = this.MAX_COMBO_TIME;

          // Refill dash energy
          this.player.dashEnergy = Math.min(this.player.maxEnergy, this.player.dashEnergy + 40);

          soundFX.playCollectPrism();
          this.particles.spawnBurst(item.x, item.y, '#06b6d4', 16, 200);
          this.particles.spawnText(`+${gained}!`, item.x, item.y - 10, '#06b6d4', 16);
          this.triggerScreenShake(3, 0.1);
        }

        this.collectibles.items.splice(i, 1);
      }
    }

    // 9. Enemy Collision & Near-Miss Graze Detection
    const playerHitboxRadius = this.player.radius * 0.75; // Fair inner core

    for (const enemy of this.enemies.enemies) {
      if (!enemy.isLethal) continue;

      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);

      // A. Fatal Collision Check
      if (dist < playerHitboxRadius + enemy.radius) {
        if (this.player.isDashing) {
          // Phase shift invulnerability: dashing through an enemy pushes them and awards graze!
          const grazeKey = enemy.id;
          if (!this.grazedEnemies.has(grazeKey)) {
            this.grazesCount++;
            this.score += 150;
            this.grazedEnemies.set(grazeKey, this.survivalTime);
            soundFX.playGraze();
            this.particles.spawnBurst(enemy.x, enemy.y, '#38bdf8', 12, 160);
            this.particles.spawnText('PHASE!', this.player.x, this.player.y - 12, '#38bdf8', 14);
          }
        } else {
          // LETHAL HIT -> GAME OVER
          this.handlePlayerDeath();
          return;
        }
      }

      // B. Near-Miss Graze (Passing close without touching)
      const grazeThreshold = this.player.radius + enemy.radius + 18;
      if (dist < grazeThreshold && dist >= playerHitboxRadius + enemy.radius) {
        const lastGraze = this.grazedEnemies.get(enemy.id) || 0;
        if (this.survivalTime - lastGraze > 1.2) {
          this.grazedEnemies.set(enemy.id, this.survivalTime);
          this.grazesCount++;
          this.score += 50;
          this.player.dashEnergy = Math.min(this.player.maxEnergy, this.player.dashEnergy + 6);
          soundFX.playGraze();
          this.particles.spawnBurst(
            (this.player.x + enemy.x) / 2,
            (this.player.y + enemy.y) / 2,
            '#a855f7',
            4,
            70
          );
          this.particles.spawnText('GRAZE +50', this.player.x, this.player.y - 10, '#c084fc', 11);
        }
      }
    }
  }

  private handlePlayerDeath() {
    this.setState('GAMEOVER');
    soundFX.playGameOver();
    this.triggerScreenShake(8, 0.4);

    // Death explosion
    this.particles.spawnBurst(this.player.x, this.player.y, '#ffffff', 24, 220);
    this.particles.spawnBurst(this.player.x, this.player.y, '#38bdf8', 18, 160);
    this.particles.spawnBurst(this.player.x, this.player.y, '#f43f5e', 14, 130);

    const finalScore = Math.floor(this.score);
    const { isNewBest } = storage.recordGame(
      finalScore,
      Math.floor(this.survivalTime),
      this.sparksCollected
    );

    this.callbacks.onGameOver({
      score: finalScore,
      bestScore: storage.getHighScore(),
      survivalTime: Math.floor(this.survivalTime),
      sparksCollected: this.sparksCollected,
      prismsCollected: this.prismsCollected,
      grazesCount: this.grazesCount,
      isNewBest,
    });
  }

  private render() {
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;

    ctx.save();
    ctx.scale(dpr, dpr);

    const rect = this.canvas.getBoundingClientRect();

    // Screen shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTime > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeMagnitude;
      shakeY = (Math.random() - 0.5) * this.screenShakeMagnitude;
    }
    ctx.translate(shakeX, shakeY);

    // 1. Clear full canvas backdrop
    ctx.fillStyle = ARENA_CONFIG.BG_COLOR;
    ctx.fillRect(-10, -10, rect.width + 20, rect.height + 20);

    // 2. Render Arena Interior & Ambient Grid
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.arena.x, this.arena.y, this.arena.width, this.arena.height);
    ctx.clip();

    // Arena Floor
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(this.arena.x, this.arena.y, this.arena.width, this.arena.height);

    // Subtle Grid
    ctx.strokeStyle = ARENA_CONFIG.GRID_COLOR;
    ctx.lineWidth = 1;

    const startX = this.arena.x + (ARENA_CONFIG.GRID_SIZE - (this.arena.x % ARENA_CONFIG.GRID_SIZE));
    for (let x = startX; x < this.arena.x + this.arena.width; x += ARENA_CONFIG.GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, this.arena.y);
      ctx.lineTo(x, this.arena.y + this.arena.height);
      ctx.stroke();
    }

    const startY = this.arena.y + (ARENA_CONFIG.GRID_SIZE - (this.arena.y % ARENA_CONFIG.GRID_SIZE));
    for (let y = startY; y < this.arena.y + this.arena.height; y += ARENA_CONFIG.GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(this.arena.x, y);
      ctx.lineTo(this.arena.x + this.arena.width, y);
      ctx.stroke();
    }

    // Render Entities inside arena
    this.collectibles.render(ctx);
    this.enemies.render(ctx, this.arena);
    this.particles.render(ctx);

    if (this.state !== 'GAMEOVER') {
      this.player.render(ctx);
    }

    // Render event atmosphere layer (Spotlight darkness, Vortex rings, Sanctuary dome)
    this.events.renderEventAtmosphere(ctx, this.arena, this.player.x, this.player.y);

    ctx.restore(); // Exit arena clip

    // 2.5. If arena is shrinking, render ghost outer boundary
    if (this.events.shrinkProgress > 0.02) {
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.baseArena.x, this.baseArena.y, this.baseArena.width, this.baseArena.height);
      ctx.restore();
    }

    // 3. Render Arena Glowing Border Frame
    ctx.save();
    const eventStatus = this.events.getStatus();
    let borderColor = '#38bdf8';
    let shadowColor = 'rgba(56, 189, 248, 0.4)';

    if (eventStatus.active) {
      borderColor = eventStatus.color;
      shadowColor = eventStatus.color;
    }

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 12;
    ctx.strokeRect(this.arena.x, this.arena.y, this.arena.width, this.arena.height);

    // Corner decorative brackets
    const bracketSize = 16;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 6;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(this.arena.x, this.arena.y + bracketSize);
    ctx.lineTo(this.arena.x, this.arena.y);
    ctx.lineTo(this.arena.x + bracketSize, this.arena.y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(this.arena.x + this.arena.width - bracketSize, this.arena.y);
    ctx.lineTo(this.arena.x + this.arena.width, this.arena.y);
    ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(this.arena.x, this.arena.y + this.arena.height - bracketSize);
    ctx.lineTo(this.arena.x, this.arena.y + this.arena.height);
    ctx.lineTo(this.arena.x + bracketSize, this.arena.y + this.arena.height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(this.arena.x + this.arena.width - bracketSize, this.arena.y + this.arena.height);
    ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + this.arena.height);
    ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + this.arena.height - bracketSize);
    ctx.stroke();

    ctx.restore();

    // Event warning handling:
    if (this.events.isWarningActive()) {
      const status = this.events.getStatus();

      if (status.isTransparentPhase) {
        // Transparent Recon Phase (last 2 seconds):
        // Canvas is 100% transparent (no dark wash) so user can clearly see their ship and all hazards!
        // Render tactical reconnaissance overlays:
        ctx.save();

        // 1. Highlight Player Ship
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius + 16, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        const crosshairDist = this.player.radius + 22;
        ctx.beginPath();
        ctx.moveTo(this.player.x - crosshairDist, this.player.y);
        ctx.lineTo(this.player.x - crosshairDist + 7, this.player.y);
        ctx.moveTo(this.player.x + crosshairDist - 7, this.player.y);
        ctx.lineTo(this.player.x + crosshairDist, this.player.y);
        ctx.moveTo(this.player.x, this.player.y - crosshairDist);
        ctx.lineTo(this.player.x, this.player.y - crosshairDist + 7);
        ctx.moveTo(this.player.x, this.player.y + crosshairDist - 7);
        ctx.lineTo(this.player.x, this.player.y + crosshairDist);
        ctx.stroke();

        // Player Tag
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillText('▼ YOUR SHIP', this.player.x, this.player.y - this.player.radius - 12);

        // 2. Highlight Enemy Hazards & Projected Directions
        for (const enemy of this.enemies.enemies) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius + 10, 0, Math.PI * 2);
          ctx.stroke();

          // Dotted trajectory vector
          if (enemy.vx !== 0 || enemy.vy !== 0) {
            const len = Math.hypot(enemy.vx, enemy.vy);
            if (len > 0.1) {
              const nx = (enemy.vx / len) * 45;
              const ny = (enemy.vy / len) * 45;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(enemy.x, enemy.y);
              ctx.lineTo(enemy.x + nx, enemy.y + ny);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }

          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#f87171';
          ctx.shadowBlur = 6;
          ctx.fillText('HAZARD', enemy.x, enemy.y + enemy.radius + 6);
        }

        ctx.restore();
      } else {
        // Briefing Phase (first 5 seconds): subtle dark wash behind briefing modal
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.fillRect(-10, -10, rect.width + 20, rect.height + 20);
        ctx.restore();
      }
    }

    ctx.restore(); // Exit DPR scaling
  }
}
