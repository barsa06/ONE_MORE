import { GameEventType, EventStatus, ArenaBounds, Vector2 } from './types';
import { soundFX } from './SoundFX';

interface EventConfig {
  type: GameEventType;
  name: string;
  tagline: string;
  description: string;
  details: string[];
  duration: number; // in seconds
  color: string;
}

const EVENT_CONFIGS: EventConfig[] = [
  {
    type: 'SPEED_SURGE',
    name: 'SPEED SURGE',
    tagline: 'Adrenaline Overdrive',
    description: 'Enemies are 35% faster — 2x Score Multiplier Active!',
    details: [
      '⚡ Hostile Acceleration: All enemies move 35% faster across the entire arena.',
      '💎 High-Risk Scoring: Base score multiplier is doubled (2x Score Multiplier).',
      '🛡️ Tactical Evasion: Conserve your Phase Dash for tight corners and avoid herding near walls.',
    ],
    duration: 14,
    color: '#f59e0b',
  },
  {
    type: 'SHRINKING_ARENA',
    name: 'SHRINKING ARENA',
    tagline: 'Perimeter Boundary Collapse',
    description: 'Playable area contracting — Watch the borders!',
    details: [
      '🚧 Perimeter Contraction: Outer containment boundaries collapse inward by 22%.',
      '⚠️ High Hazard Density: Significantly tighter space with faster bouncing hazards.',
      '🏃 Evacuation Order: Move toward the center zone before the perimeter boundary locks.',
    ],
    duration: 15,
    color: '#ef4444',
  },
  {
    type: 'GRAVITY_VORTEX',
    name: 'GRAVITY VORTEX',
    tagline: 'Singularity Spatial Anomaly',
    description: 'A gravitational vortex is pulling toward the center!',
    details: [
      '🌀 Singularity Pull: An intense gravitational anomaly pulls your ship toward the center.',
      '⚠️ Altered Physics: Steering inertia is warped; continuous opposing thrust is required.',
      '🚀 Slingshot Strategy: Orbit the outer radius and boost dash outward to break orbit.',
    ],
    duration: 14,
    color: '#a855f7',
  },
  {
    type: 'SAFE_ZONE',
    name: 'SANCTUARY DOME',
    tagline: 'Kinetic Shield Haven',
    description: 'Step inside the green safe zone to repel enemies & gain bonus score!',
    details: [
      '🛡️ Kinetic Haven: A drifting emerald shield deploys that knocks back and repels all hostiles.',
      '🔋 Rapid Overcharge: Standing inside the dome rapidly recharges Phase Dash energy.',
      '✨ Score Surge: Earn continuous bonus score while sheltered safely inside the sanctuary.',
    ],
    duration: 16,
    color: '#10b981',
  },
  {
    type: 'DARKNESS',
    name: 'NIGHTFALL',
    tagline: 'Total Sensor Blackout',
    description: 'Visibility restricted — navigate by your spotlight!',
    details: [
      '🌑 Sensor Blackout: Arena lights cut out; vision is restricted to your ship spotlight.',
      '🚨 Stealth Threats: Hostiles emerge suddenly from deep shadows at close proximity.',
      '✨ Beacon Navigation: Follow glowing spark pickups to maintain high multiplier safely.',
    ],
    duration: 15,
    color: '#06b6d4',
  },
];

export class EventManager {
  private timeUntilNextEvent: number = 18; // 18s initial delay before first event
  private isWarning: boolean = false;
  private warningTimer: number = 0;
  private lastBeepCount: number = 0;

  public activeEvent: EventConfig | null = null;
  public eventTimer: number = 0;
  private eventIndex: number = 0;

  // Event specific properties
  // Shrinking arena progress (0 = normal, 1 = maximum shrink)
  public shrinkProgress: number = 0;

  // Safe zone position and velocity
  public safeZonePos: Vector2 = { x: 0, y: 0 };
  public safeZoneVel: Vector2 = { x: 0, y: 0 };
  public safeZoneRadius: number = 85;

  // Vortex rotation phase
  public vortexAngle: number = 0;

  public reset(arena: ArenaBounds) {
    this.timeUntilNextEvent = 18;
    this.isWarning = false;
    this.warningTimer = 0;
    this.activeEvent = null;
    this.eventTimer = 0;
    this.shrinkProgress = 0;
    this.safeZonePos = { x: arena.x + arena.width / 2, y: arena.y + arena.height / 2 };
  }

  public isWarningActive(): boolean {
    return this.isWarning;
  }

  public skipWarning(arena: ArenaBounds) {
    if (this.isWarning && this.activeEvent) {
      this.startEvent(arena);
    }
  }

  public update(dt: number, baseArena: ArenaBounds) {
    this.vortexAngle += dt * 2.5;

    // 1. In Active Event
    if (this.activeEvent && !this.isWarning) {
      this.eventTimer -= dt;

      // Shrinking arena lerp
      if (this.activeEvent.type === 'SHRINKING_ARENA') {
        const remaining = this.eventTimer;
        // In the first 2.5s, shrink to 1; in the last 2.5s, expand back to 0
        if (remaining > 2.5) {
          this.shrinkProgress = Math.min(1, this.shrinkProgress + dt / 2.5);
        } else {
          this.shrinkProgress = Math.max(0, this.shrinkProgress - dt / 2.5);
        }
      }

      // Safe Zone drifting
      if (this.activeEvent.type === 'SAFE_ZONE') {
        this.safeZonePos.x += this.safeZoneVel.x * dt;
        this.safeZonePos.y += this.safeZoneVel.y * dt;

        // Bounce within arena
        const pad = this.safeZoneRadius + 30;
        if (this.safeZonePos.x < baseArena.x + pad || this.safeZonePos.x > baseArena.x + baseArena.width - pad) {
          this.safeZoneVel.x = -this.safeZoneVel.x;
        }
        if (this.safeZonePos.y < baseArena.y + pad || this.safeZonePos.y > baseArena.y + baseArena.height - pad) {
          this.safeZoneVel.y = -this.safeZoneVel.y;
        }
      }

      // Event Expiry
      if (this.eventTimer <= 0) {
        this.endEvent();
      }
      return;
    }

    // 2. In Warning State (Game world is paused; 5s briefing 8,7,6,5,4 + 3s transparent battlefield recon 3,2,1)
    if (this.isWarning) {
      this.warningTimer -= dt;
      const currentSecond = Math.ceil(this.warningTimer);

      if (currentSecond !== this.lastBeepCount && currentSecond >= 1 && currentSecond <= 8) {
        this.lastBeepCount = currentSecond;
        // Escalating pitch on 3, 2, 1
        soundFX.playWarningBeep(currentSecond <= 3 ? currentSecond : Math.max(1, currentSecond - 3));
      }

      if (this.warningTimer <= 0) {
        this.startEvent(baseArena);
      }
      return;
    }

    // 3. Normal Interval Countdown
    this.timeUntilNextEvent -= dt;
    if (this.timeUntilNextEvent <= 0) {
      this.isWarning = true;
      this.warningTimer = 8.0; // 5s briefing (8,7,6,5,4) + 3s transparent recon countdown (3,2,1)
      this.lastBeepCount = 9;
      soundFX.playWarningBeep(5);
      // Pre-select next event
      const nextConfig = EVENT_CONFIGS[this.eventIndex % EVENT_CONFIGS.length];
      this.activeEvent = nextConfig;
      this.eventIndex++;
    }
  }

  private startEvent(arena: ArenaBounds) {
    this.isWarning = false;
    this.warningTimer = 0;
    if (!this.activeEvent) return;

    this.eventTimer = this.activeEvent.duration;
    soundFX.playEventStart();

    // Initialize event specific state
    if (this.activeEvent.type === 'SAFE_ZONE') {
      this.safeZonePos = {
        x: arena.x + arena.width / 2 + (Math.random() - 0.5) * 100,
        y: arena.y + arena.height / 2 + (Math.random() - 0.5) * 100,
      };
      const angle = Math.random() * Math.PI * 2;
      const spd = 75;
      this.safeZoneVel = { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd };
    }
  }

  private endEvent() {
    this.activeEvent = null;
    this.shrinkProgress = 0;
    this.timeUntilNextEvent = 22 + Math.random() * 8; // next event in 22-30s
    soundFX.playEventEnd();
  }

  public getAdjustedArena(baseArena: ArenaBounds): ArenaBounds {
    if (this.shrinkProgress <= 0.01) return baseArena;

    // Maximum shrink: 22% reduction on each axis
    const shrinkX = baseArena.width * 0.22 * this.shrinkProgress;
    const shrinkY = baseArena.height * 0.22 * this.shrinkProgress;

    return {
      x: baseArena.x + shrinkX,
      y: baseArena.y + shrinkY,
      width: baseArena.width - shrinkX * 2,
      height: baseArena.height - shrinkY * 2,
    };
  }

  public getStatus(): EventStatus {
    if (this.isWarning && this.activeEvent) {
      const isTransparent = this.warningTimer <= 3.0;
      return {
        active: true,
        type: this.activeEvent.type,
        name: this.activeEvent.name,
        tagline: this.activeEvent.tagline,
        description: this.activeEvent.description,
        details: this.activeEvent.details,
        isWarning: true,
        isTransparentPhase: isTransparent,
        warningSeconds: Math.max(1, Math.ceil(this.warningTimer)),
        briefingSecondsRemaining: Math.max(0, this.warningTimer - 3.0),
        reconSecondsRemaining: Math.max(0, this.warningTimer),
        durationRemaining: Math.max(0, this.warningTimer),
        totalDuration: 8,
        color: this.activeEvent.color,
      };
    }

    if (this.activeEvent && !this.isWarning) {
      return {
        active: true,
        type: this.activeEvent.type,
        name: this.activeEvent.name,
        tagline: this.activeEvent.tagline,
        description: this.activeEvent.description,
        details: this.activeEvent.details,
        isWarning: false,
        warningSeconds: 0,
        durationRemaining: Math.max(0, this.eventTimer),
        totalDuration: this.activeEvent.duration,
        color: this.activeEvent.color,
      };
    }

    return {
      active: false,
      type: null,
      name: '',
      description: '',
      isWarning: false,
      warningSeconds: 0,
      durationRemaining: 0,
      totalDuration: 0,
      color: '#38bdf8',
    };
  }

  // Render atmospheric event layers (Vortex rings, Sanctuary dome, Darkness mask)
  public renderEventAtmosphere(
    ctx: CanvasRenderingContext2D,
    arena: ArenaBounds,
    playerX: number,
    playerY: number
  ) {
    if (!this.activeEvent) return;

    // 0. TELEGRAPHED WARNING VISUAL OVERLAY (During the 5-second countdown)
    if (this.isWarning) {
      const alphaPulse = 0.25 + 0.2 * Math.sin((5 - this.warningTimer) * 7);

      ctx.save();
      ctx.strokeStyle = this.activeEvent.color;
      ctx.globalAlpha = Math.max(0.1, alphaPulse);
      ctx.lineWidth = 2.5;

      // Pulsing corner hazard brackets
      const cornerSize = 32;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(arena.x, arena.y + cornerSize);
      ctx.lineTo(arena.x, arena.y);
      ctx.lineTo(arena.x + cornerSize, arena.y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(arena.x + arena.width - cornerSize, arena.y);
      ctx.lineTo(arena.x + arena.width, arena.y);
      ctx.lineTo(arena.x + arena.width, arena.y + cornerSize);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(arena.x, arena.y + arena.height - cornerSize);
      ctx.lineTo(arena.x, arena.y + arena.height);
      ctx.lineTo(arena.x + cornerSize, arena.y + arena.height);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(arena.x + arena.width - cornerSize, arena.y + arena.height);
      ctx.lineTo(arena.x + arena.width, arena.y + arena.height);
      ctx.lineTo(arena.x + arena.width, arena.y + arena.height - cornerSize);
      ctx.stroke();

      // Event specific telegraph guides
      if (this.activeEvent.type === 'SHRINKING_ARENA') {
        // Show dashed red outline where arena will shrink to
        const shrinkX = arena.width * 0.22;
        const shrinkY = arena.height * 0.22;
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(arena.x + shrinkX, arena.y + shrinkY, arena.width - shrinkX * 2, arena.height - shrinkY * 2);
      } else if (this.activeEvent.type === 'SAFE_ZONE') {
        // Show beacon ring ping where sanctuary will appear
        ctx.beginPath();
        ctx.arc(this.safeZonePos.x, this.safeZonePos.y, this.safeZoneRadius * (0.85 + 0.15 * Math.sin(this.warningTimer * 6)), 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([6, 6]);
        ctx.stroke();
      } else if (this.activeEvent.type === 'GRAVITY_VORTEX') {
        // Show center singularity warning circle
        const cx = arena.x + arena.width / 2;
        const cy = arena.y + arena.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([4, 6]);
        ctx.stroke();
      }

      ctx.restore();
      return;
    }

    // 1. GRAVITY VORTEX
    if (this.activeEvent.type === 'GRAVITY_VORTEX') {
      const cx = arena.x + arena.width / 2;
      const cy = arena.y + arena.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.vortexAngle);

      for (let r = 50; r < 280; r += 45) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 1.5);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Center singularity glow
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    }

    // 2. SANCTUARY DOME
    else if (this.activeEvent.type === 'SAFE_ZONE') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.safeZonePos.x, this.safeZonePos.y, this.safeZoneRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Pulsing center glyph
      ctx.beginPath();
      ctx.arc(this.safeZonePos.x, this.safeZonePos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.restore();
    }

    // 3. DARKNESS (Spotlight / Nightfall)
    else if (this.activeEvent.type === 'DARKNESS') {
      ctx.save();
      // Draw radial gradient dark mask over the entire arena
      const spotlightRadius = 210;
      const grad = ctx.createRadialGradient(
        playerX,
        playerY,
        spotlightRadius * 0.3,
        playerX,
        playerY,
        spotlightRadius
      );
      grad.addColorStop(0, 'rgba(9, 13, 22, 0)');
      grad.addColorStop(0.7, 'rgba(9, 13, 22, 0.7)');
      grad.addColorStop(1, 'rgba(9, 13, 22, 0.94)');

      ctx.fillStyle = grad;
      ctx.fillRect(arena.x, arena.y, arena.width, arena.height);
      ctx.restore();
    }
  }
}
