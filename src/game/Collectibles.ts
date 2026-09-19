import { Collectible, CollectibleType, ArenaBounds } from './types';

export class CollectibleManager {
  public items: Collectible[] = [];
  private nextId: number = 1;
  private spawnTimer: number = 0;
  private prismTimer: number = 0;

  public reset() {
    this.items = [];
    this.spawnTimer = 0;
    this.prismTimer = 0;
  }

  public update(
    dt: number,
    bounds: ArenaBounds,
    playerX: number,
    playerY: number,
    isDashing: boolean
  ) {
    this.spawnTimer += dt;
    this.prismTimer += dt;

    // Spawn sparks if below capacity (target: 6 sparks)
    const activeSparks = this.items.filter((i) => i.type === 'SPARK').length;
    if (activeSparks < 6 && this.spawnTimer > 0.8) {
      this.spawnTimer = 0;
      this.spawnItem('SPARK', bounds);
    }

    // Spawn prism occasionally (every ~14 seconds or if none exists and timer > 8s)
    const activePrisms = this.items.filter((i) => i.type === 'PRISM').length;
    if (activePrisms < 1 && this.prismTimer > 10) {
      this.prismTimer = 0;
      this.spawnItem('PRISM', bounds);
    }

    // Magnet distance: wider during dash
    const magnetDist = isDashing ? 120 : 65;

    // Update existing items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.pulsePhase += dt * 5;
      item.lifetime -= dt;

      // Despawn expired items
      if (item.lifetime <= 0) {
        this.items.splice(i, 1);
        continue;
      }

      // Check magnet pull toward player
      const dx = playerX - item.x;
      const dy = playerY - item.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetDist && dist > 1) {
        const pullSpeed = (1 - dist / magnetDist) * 380 + 120;
        item.vx += (dx / dist) * pullSpeed * dt * 4;
        item.vy += (dy / dist) * pullSpeed * dt * 4;
      }

      // Apply drag
      item.vx *= 0.92;
      item.vy *= 0.92;

      item.x += item.vx * dt;
      item.y += item.vy * dt;

      // Keep within arena bounds
      item.x = Math.max(bounds.x + item.radius, Math.min(bounds.x + bounds.width - item.radius, item.x));
      item.y = Math.max(bounds.y + item.radius, Math.min(bounds.y + bounds.height - item.radius, item.y));
    }
  }

  private spawnItem(type: CollectibleType, bounds: ArenaBounds) {
    const padding = 50;
    const x = bounds.x + padding + Math.random() * (bounds.width - padding * 2);
    const y = bounds.y + padding + Math.random() * (bounds.height - padding * 2);

    const isPrism = type === 'PRISM';
    this.items.push({
      id: this.nextId++,
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      radius: isPrism ? 9 : 7,
      baseValue: isPrism ? 500 : 100,
      lifetime: isPrism ? 16 : 10,
      maxLifetime: isPrism ? 16 : 10,
      pulsePhase: Math.random() * Math.PI,
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const item of this.items) {
      const isPrism = item.type === 'PRISM';
      const color = isPrism ? '#06b6d4' : '#fbbf24';
      const glow = isPrism ? 'rgba(6, 182, 212, 0.8)' : 'rgba(251, 191, 36, 0.8)';

      // Blink when remaining lifetime < 2.5s
      let alpha = 1;
      if (item.lifetime < 2.5) {
        alpha = Math.sin(item.lifetime * 16) > 0 ? 1 : 0.25;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(item.x, item.y);
      ctx.rotate(item.pulsePhase * 0.4);

      // Outer halo
      ctx.beginPath();
      const pulseRadius = item.radius + Math.sin(item.pulsePhase) * 2;
      ctx.arc(0, 0, pulseRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = isPrism ? 'rgba(6, 182, 212, 0.2)' : 'rgba(251, 191, 36, 0.2)';
      ctx.fill();

      // Main core
      ctx.beginPath();
      if (isPrism) {
        // Diamond crystal shape
        ctx.moveTo(0, -item.radius);
        ctx.lineTo(item.radius, 0);
        ctx.lineTo(0, item.radius);
        ctx.lineTo(-item.radius, 0);
        ctx.closePath();
      } else {
        // Spark circle with mini star spikes
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      }

      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Inner white glint
      ctx.beginPath();
      ctx.arc(0, 0, item.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.restore();
    }
  }
}
