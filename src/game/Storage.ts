import { GameSettings, SkinConfig } from './types';

export const SKINS: SkinConfig[] = [
  {
    id: 'CYAN_CORE',
    name: 'Cyan Core',
    description: 'The standard issue high-frequency pulse ship.',
    primaryColor: '#38bdf8',
    secondaryColor: '#0284c7',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    unlockScore: 0,
  },
  {
    id: 'NEON_GOLD',
    name: 'Solar Surge',
    description: 'Forged in raw stellar flare energy.',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    unlockScore: 5000,
  },
  {
    id: 'VIOLET_VORTEX',
    name: 'Void Phantom',
    description: 'Phases directly through gravitational anomalies.',
    primaryColor: '#a855f7',
    secondaryColor: '#7e22ce',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    unlockScore: 15000,
  },
  {
    id: 'EMERALD_PULSE',
    name: 'Sanctuary Aegis',
    description: 'Carries protective resonance shields.',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    unlockScore: 30000,
  },
  {
    id: 'CRIMSON_BLAZE',
    name: 'Hyperdrive',
    description: 'Overclocked thrusters with redline ignition trails.',
    primaryColor: '#ef4444',
    secondaryColor: '#b91c1c',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    unlockScore: 50000,
  },
];

const STORAGE_KEY = 'one_more_save_v1';

export interface SaveData {
  highScore: number;
  bestSurvivalTime: number; // in seconds
  totalGames: number;
  totalSparks: number;
  settings: GameSettings;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.9,
  screenShake: true,
  reducedMotion: false,
  selectedSkin: 'CYAN_CORE',
};

const DEFAULT_SAVE: SaveData = {
  highScore: 0,
  bestSurvivalTime: 0,
  totalGames: 0,
  totalSparks: 0,
  settings: DEFAULT_SETTINGS,
};

export class StorageManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch {
      // Ignore private browsing / quota restrictions
    }
    return { ...DEFAULT_SAVE };
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore
    }
  }

  public getHighScore(): number {
    return this.data.highScore;
  }

  public getBestSurvivalTime(): number {
    return this.data.bestSurvivalTime;
  }

  public getTotalGames(): number {
    return this.data.totalGames;
  }

  public getSettings(): GameSettings {
    return { ...this.data.settings };
  }

  public updateSettings(partial: Partial<GameSettings>): GameSettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
    return { ...this.data.settings };
  }

  public recordGame(score: number, survivalTime: number, sparks: number): { isNewBest: boolean } {
    let isNewBest = false;
    if (score > this.data.highScore) {
      this.data.highScore = score;
      isNewBest = true;
    }
    if (survivalTime > this.data.bestSurvivalTime) {
      this.data.bestSurvivalTime = survivalTime;
    }

    this.data.totalGames += 1;
    this.data.totalSparks += sparks;
    this.save();

    return { isNewBest };
  }
}

export const storage = new StorageManager();

