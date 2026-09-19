import { Enemy, ArenaBounds, Vector2, EnemyType } from './types';
import { soundFX } from './SoundFX';

export class EnemyManager {
  public enemies: Enemy[] = [];
  private nextId: number = 1;
  private spawnInterval: number = 2.4; // seconds between spawns
  private spawnTimer: number = 1.0; // initial grace before first enemy

  public reset() {
    this.enemies = [];
    this.spawnTimer = 1.2;
    this.spawnInterval = 2.4;
  }

  public update(
    dt: number,
    bounds: ArenaBounds,
    playerPos: Vector2,
    survivalTime: number,
    speedMultiplier: number = 1.0,
    safeZone?: { pos: Vector2; radius: number } | null
  ) {
    // Dynamic difficulty: gradually decrease spawn interval and increase max enemies
    // e.g., at 0s: max 3 enemies; at 60s: max 8 enemies; at 120s: max 14 enemies
    const maxEnemies = Math.min(15, Math.floor(3 + survivalTime / 12));
    this.spawnInterval = Math.max(1.2, 2.5 - survivalTime / 60);

    this.spawnTimer += dt;
    if (this.enemies.length < maxEnemies && this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(bounds, playerPos, survivalTime);
    }

    // Update each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const effectiveSpeed = e.speed * speedMultiplier;

      // Handle spawn grace period
      if (e.spawnTimer > 0) {
        e.spawnTimer -= dt;
        if (e.spawnTimer <= 0) {
          e.isLethal = true;
        }
        continue;
      }

      // Safe zone repulsion
      if (safeZone && e.isLethal) {
        const dxToSafe = e.x - safeZone.pos.x;
        const dyToSafe = e.y - safeZone.pos.y;
        const distToSafe = Math.hypot(dxToSafe, dyToSafe);
        if (distToSafe < safeZone.radius + e.radius + 15 && distToSafe > 0.1) {
          const pushForce = ((safeZone.radius + e.radius + 15 - distToSafe) / safeZone.radius) * 260;
          e.x += (dxToSafe / distToSafe) * pushForce * dt;
          e.y += (dyToSafe / distToSafe) * pushForce * dt;
        }
      }

      // Archetype 1: DRIFTER (Steady tracking)
      if (e.type === 'DRIFTER') {
        const dx = playerPos.x - e.x;
        const dy = playerPos.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1) {
          const targetAngle = Math.atan2(dy, dx);
          // Smoothly turn angle toward target
          e.angle = targetAngle;
          e.vx = Math.cos(e.angle) * effectiveSpeed;
          e.vy = Math.sin(e.angle) * effectiveSpeed;
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;

        // Keep in arena
        this.clampToBounds(e, bounds);
      }

      // Archetype 2: DART (Dasher with laser telegraph)
      else if (e.type === 'DART') {
        e.stateTimer = (e.stateTimer || 0) - dt;

        if (e.dartState === 'TRACKING') {
          const dx = playerPos.x - e.x;
          const dy = playerPos.y - e.y;
          e.aimAngle = Math.atan2(dy, dx);
          e.angle = e.aimAngle;

          // Slow positioning
          e.vx = Math.cos(e.angle) * (effectiveSpeed * 0.4);
          e.vy = Math.sin(e.angle) * (effectiveSpeed * 0.4);
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          this.clampToBounds(e, bounds);

          if (e.stateTimer <= 0) {
            e.dartState = 'TELEGRAPHING';
            e.stateTimer = 0.65; // telegraph duration
            e.vx = 0;
            e.vy = 0;
            soundFX.playTelegraph();
          }
        } else if (e.dartState === 'TELEGRAPHING') {
          // Locked in place, aiming laser line flashes
          if (e.stateTimer <= 0) {
            e.dartState = 'DASHING';
            e.stateTimer = 0.38; // dash burst duration
            const dashSpeed = effectiveSpeed * 2.8;
            e.vx = Math.cos(e.aimAngle || e.angle) * dashSpeed;
            e.vy = Math.sin(e.aimAngle || e.angle) * dashSpeed;
          }
        } else if (e.dartState === 'DASHING') {
          e.x += e.vx * dt;
          e.y += e.vy * dt;

          // Bounce off arena walls during dash
          if (e.x < bounds.x + e.radius || e.x > bounds.x + bounds.width - e.radius) {
            e.vx = -e.vx;
          }
          if (e.y < bounds.y + e.radius || e.y > bounds.y + bounds.height - e.radius) {
            e.vy = -e.vy;
          }
          this.clampToBounds(e, bounds);

          if (e.stateTimer <= 0) {
            e.dartState = 'COOLDOWN';
            e.stateTimer = 0.85;
            e.vx *= 0.2;
            e.vy *= 0.2;
          }
        } else if (e.dartState === 'COOLDOWN') {
          e.vx *= 0.9;
          e.vy *= 0.9;
          e.x += e.vx * dt;
          e.y += e.vy * dt;

          if (e.stateTimer <= 0) {
            e.dartState = 'TRACKING';
            e.stateTimer = 1.6;
          }
        }
      }

      // Archetype 3: ORBITAL (Continuous bouncing hazard)
      else if (e.type === 'ORBITAL') {
        e.angle += (e.rotSpeed || 3.0) * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        // Bounce off arena walls
        if (e.x <= bounds.x + e.radius) {
          e.x = bounds.x + e.radius;
          e.vx = Math.abs(e.vx);
        } else if (e.x >= bounds.x + bounds.width - e.radius) {
          e.x = bounds.x + bounds.width - e.radius;
          e.vx = -Math.abs(e.vx);
        }

        if (e.y <= bounds.y + e.radius) {
          e.y = bounds.y + e.radius;
          e.vy = Math.abs(e.vy);
        } else if (e.y >= bounds.y + bounds.height - e.radius) {
          e.y = bounds.y + bounds.height - e.radius;
          e.vy = -Math.abs(e.vy);
        }
      }
    }
  }

  private clampToBounds(e: Enemy, bounds: ArenaBounds) {
    e.x = Math.max(bounds.x + e.radius, Math.min(bounds.x + bounds.width - e.radius, e.x));
    e.y = Math.max(bounds.y + e.radius, Math.min(bounds.y + bounds.height - e.radius, e.y));
  }

  private spawnEnemy(bounds: ArenaBounds, playerPos: Vector2, survivalTime: number) {
    // Choose spawn position far from player (min 190px away)
    let x = 0;
    let y = 0;
    let attempts = 0;

    do {
      // Pick along perimeter or inside arena with padding
      if (Math.random() < 0.7) {
        // Along edges
        const side = Math.floor(Math.random() * 4);
        if (side === 0) {
          x = bounds.x + 30 + Math.random() * (bounds.width - 60);
          y = bounds.y + 30;
        } else if (side === 1) {
          x = bounds.x + bounds.width - 30;
          y = bounds.y + 30 + Math.random() * (bounds.height - 60);
        } else if (side === 2) {
          x = bounds.x + 30 + Math.random() * (bounds.width - 60);
          y = bounds.y + bounds.height - 30;
        } else {
          x = bounds.x + 30;
          y = bounds.y + 30 + Math.random() * (bounds.height - 60);
        }
      } else {
        x = bounds.x + 40 + Math.random() * (bounds.width - 80);
        y = bounds.y + 40 + Math.random() * (bounds.height - 80);
      }
      attempts++;
    } while (Math.hypot(x - playerPos.x, y - playerPos.y) < 190 && attempts < 15);

    // Pick type: Drifter initially, Dart after 15s, Orbital after 30s
    let type: EnemyType = 'DRIFTER';
    if (survivalTime > 30 && Math.random() < 0.28) {
      type = 'ORBITAL';
    } else if (survivalTime > 15 && Math.random() < 0.45) {
      type = 'DART';
    }

    const baseSpeed =
      type === 'DRIFTER'
        ? 120 + Math.min(60, survivalTime * 0.7)
        : type === 'ORBITAL'
        ? 150
        : 160;

    let initVx = 0;
    let initVy = 0;
    if (type === 'ORBITAL') {
      const angle = (Math.floor(Math.random() * 4) * Math.PI) / 2 + Math.PI / 4;
      initVx = Math.cos(angle) * baseSpeed;
      initVy = Math.sin(angle) * baseSpeed;
    }

    this.enemies.push({
      id: this.nextId++,
      type,
      x,
      y,
      vx: initVx,
      vy: initVy,
      radius: type === 'DRIFTER' ? 13 : type === 'ORBITAL' ? 14 : 15,
      speed: baseSpeed,
      spawnTimer: 0.75, // 750ms non-lethal telegraph period
      isLethal: false,
      angle: 0,
      dartState: 'TRACKING',
      stateTimer: 1.2,
      aimAngle: 0,
      rotSpeed: 3.5,
    });
  }

  public render(ctx: CanvasRenderingContext2D, bounds: ArenaBounds) {
    for (const e of this.enemies) {
      // 1. Telegraph Warning Indicator during spawn grace
      if (!e.isLethal) {
        const progress = 1 - e.spawnTimer / 0.75;
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + (1 - progress) * 25, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing warning center exclamation
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      // 2. Render Dart Laser Telegraph Line
      if (e.type === 'DART' && e.dartState === 'TELEGRAPHING') {
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const laserLength = 700;
        const targetX = e.x + Math.cos(e.aimAngle || 0) * laserLength;
        const targetY = e.y + Math.sin(e.aimAngle || 0) * laserLength;

        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Enemy Silhouette
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      if (e.type === 'DRIFTER') {
        // Ruby diamond silhouette
        ctx.beginPath();
        ctx.moveTo(e.radius * 1.2, 0);
        ctx.lineTo(0, -e.radius * 0.9);
        ctx.lineTo(-e.radius * 1.2, 0);
        ctx.lineTo(0, e.radius * 0.9);
        ctx.closePath();

        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Core eye
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else if (e.type === 'ORBITAL') {
        // ORBITAL: Rotating spiky hazard sawblade
        const teeth = 6;
        ctx.beginPath();
        for (let t = 0; t < teeth * 2; t++) {
          const a = (t * Math.PI) / teeth;
          const r = t % 2 === 0 ? e.radius * 1.25 : e.radius * 0.75;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = 'rgba(249, 115, 22, 0.85)';
        ctx.shadowBlur = 12;
        ctx.fill();

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // DART: Sharp forward Chevron / Arrow
        ctx.beginPath();
        ctx.moveTo(e.radius * 1.3, 0);
        ctx.lineTo(-e.radius, -e.radius);
        ctx.lineTo(-e.radius * 0.4, 0);
        ctx.lineTo(-e.radius, e.radius);
        ctx.closePath();

        const isDashing = e.dartState === 'DASHING';
        ctx.fillStyle = isDashing ? '#ffffff' : '#fb7185';
        ctx.shadowColor = isDashing ? '#ffffff' : 'rgba(251, 113, 133, 0.9)';
        ctx.shadowBlur = isDashing ? 18 : 10;
        ctx.fill();

        // Aiming beam dot
        ctx.beginPath();
        ctx.arc(e.radius * 0.5, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe4e6';
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
