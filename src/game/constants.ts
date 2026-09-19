// ONE MORE - Game Constants & Tuning

export const ARENA_CONFIG = {
  DEFAULT_WIDTH: 900,
  DEFAULT_HEIGHT: 650,
  BORDER_COLOR: '#334155',
  BG_COLOR: '#090d16',
  GRID_COLOR: 'rgba(51, 65, 85, 0.15)',
  GRID_SIZE: 40,
};

export const PLAYER_CONFIG = {
  RADIUS: 14,
  BASE_SPEED: 340, // pixels per second
  ACCELERATION: 1800,
  FRICTION: 0.88, // damping factor per tick
  COLOR: '#ffffff',
  GLOW_COLOR: 'rgba(56, 189, 248, 0.8)',
  TRAIL_COLOR: 'rgba(56, 189, 248, ',
  MAX_TRAIL_LENGTH: 16,
  DASH_SPEED: 850,
  DASH_DURATION: 0.14, // seconds
  DASH_COOLDOWN: 1.2, // seconds
  DASH_COST: 35, // energy percent
  ENERGY_RECHARGE_RATE: 25, // energy per second
};

export const COLOR_PALETTE = {
  VOID: '#090d16',
  PANEL: '#0f172a',
  TEXT_MUTED: '#94a3b8',
  TEXT_LIGHT: '#f8fafc',
  ACCENT_CYAN: '#38bdf8',
  ACCENT_AMBER: '#fbbf24',
  ACCENT_ROSE: '#f43f5e',
  ACCENT_EMERALD: '#10b981',
  ACCENT_VIOLET: '#a855f7',
};
