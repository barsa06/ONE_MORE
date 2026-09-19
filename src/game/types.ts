export interface Vector2 {
  x: number;
  y: number;
}

export interface ArenaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface PlayerStats {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  dashCooldown: number;
  dashTimer: number;
  isDashing: boolean;
  dashEnergy: number; // 0 to 100
  dashMaxEnergy: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  radius: number;
}

export type CollectibleType = 'SPARK' | 'PRISM';

export interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseValue: number;
  lifetime: number; // seconds remaining
  maxLifetime: number;
  pulsePhase: number;
}

export type EnemyType = 'DRIFTER' | 'DART' | 'ORBITAL';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  spawnTimer: number; // grace period before becoming lethal
  isLethal: boolean;
  angle: number;

  // Specific to DART (dasher)
  stateTimer?: number;
  dartState?: 'TRACKING' | 'TELEGRAPHING' | 'DASHING' | 'COOLDOWN';
  targetPos?: Vector2;
  aimAngle?: number;

  // Specific to ORBITAL (perimeter bouncer)
  rotSpeed?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export interface GameOverData {
  score: number;
  bestScore: number;
  survivalTime: number; // in seconds
  sparksCollected: number;
  prismsCollected: number;
  grazesCount: number;
  isNewBest: boolean;
}

export type GameEventType =
  | 'SHRINKING_ARENA'
  | 'GRAVITY_VORTEX'
  | 'SPEED_SURGE'
  | 'DARKNESS'
  | 'SAFE_ZONE';

export interface EventStatus {
  active: boolean;
  type: GameEventType | null;
  name: string;
  description: string;
  tagline?: string;
  details?: string[];
  isWarning: boolean;
  isTransparentPhase?: boolean;
  warningSeconds: number; // e.g. 8, 7, 6, 5, 4, 3, 2, 1
  briefingSecondsRemaining?: number; // 5 to 0 during briefing (8, 7, 6, 5, 4)
  reconSecondsRemaining?: number; // 3 to 0 during transparent countdown (3, 2, 1)
  durationRemaining: number;
  totalDuration: number;
  color: string;
}

export interface SkinConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  unlockScore: number;
}

export interface GameSettings {
  masterVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  screenShake: boolean;
  reducedMotion: boolean;
  selectedSkin: string;
}

