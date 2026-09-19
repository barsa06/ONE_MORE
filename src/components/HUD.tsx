import React from 'react';
import {
  Zap,
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Flame,
  Trophy,
  Clock,
  AlertTriangle,
  Activity,
  Shield,
  Compass,
  Moon,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { GameState, EventStatus } from '../game/types';

interface HUDProps {
  gameState: GameState;
  dashEnergy: number;
  fps: number;
  speed: number;
  score: number;
  bestScore: number;
  multiplier: number;
  multiplierProgress: number; // 0 to 1
  survivalTime: number;
  isMuted: boolean;
  eventStatus?: EventStatus;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onReset: () => void;
  onOpenHowToPlay?: () => void;
  onOpenSettings?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  dashEnergy,
  fps,
  speed,
  score,
  bestScore,
  multiplier,
  multiplierProgress,
  survivalTime,
  isMuted,
  eventStatus,
  onTogglePause,
  onToggleMute,
  onReset,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: string | null) => {
    switch (type) {
      case 'SPEED_SURGE':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'SAFE_ZONE':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'GRAVITY_VORTEX':
        return <Compass className="w-3.5 h-3.5 text-purple-400" />;
      case 'DARKNESS':
        return <Moon className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none flex flex-col gap-2 z-30 select-none">
      {/* Top Row: Brand & Quick Buttons */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Brand & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg">
            <span className="font-black text-sm tracking-wider text-white">ONE MORE</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1">
            <button
              id="hud-pause-btn"
              onClick={onTogglePause}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title={gameState === 'PAUSED' ? 'Resume (ESC)' : 'Pause (ESC)'}
            >
              {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              id="hud-reset-btn"
              onClick={onReset}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Restart Run (R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="hud-mute-btn"
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>

            {onOpenHowToPlay && (
              <button
                id="hud-help-btn"
                onClick={onOpenHowToPlay}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                title="How to Play Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              </button>
            )}

            {onOpenSettings && (
              <button
                id="hud-settings-btn"
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                title="Settings & Ship Skins"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Live Score Display & Multiplier */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-700/70 shadow-xl">
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-widest">SCORE</span>
            <span className="font-mono font-black text-lg sm:text-xl text-white tracking-tight leading-none">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Multiplier Badge with Decay Ring/Bar */}
          <div className="relative flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
            <Flame className={`w-3.5 h-3.5 ${multiplier > 1 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={`font-mono text-xs font-black ${multiplier > 1 ? 'text-amber-300' : 'text-slate-400'}`}>
              x{multiplier.toFixed(1)}
            </span>
            {/* Multiplier decay underline */}
            {multiplier > 1 && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full transition-all duration-75"
                style={{ width: `${multiplierProgress * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Right: Best Score & Survival Time */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[10px]">BEST:</span>
            <span className="font-bold text-white">{bestScore.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white">{formatTime(survivalTime)}</span>
          </div>
        </div>
      </div>

      {/* Sub-bar: Dash Energy Gauge & Subtle telemetry */}
      <div className="flex items-center justify-between w-full px-1">
        {/* Dash Energy Bar */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
          <Zap className={`w-3.5 h-3.5 ${dashEnergy >= 35 ? 'text-sky-400' : 'text-slate-500'}`} />
          <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                dashEnergy >= 35
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'bg-slate-600'
              }`}
              style={{ width: `${dashEnergy}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-300 font-medium">
            {Math.round(dashEnergy)}%
          </span>
        </div>

        {/* Active Event Status Tag or FPS */}
        <div className="flex items-center gap-2">
          {eventStatus?.active && !eventStatus.isWarning && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono backdrop-blur-md border shadow-lg animate-pulse"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderColor: eventStatus.color,
                color: eventStatus.color,
              }}
            >
              {getEventIcon(eventStatus.type)}
              <span className="font-black tracking-wide">{eventStatus.name}</span>
              <span className="text-[10px] text-slate-300">
                ({Math.ceil(eventStatus.durationRemaining)}s)
              </span>
            </div>
          )}

          {/* FPS Counter */}
          <div className="text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            <span className="text-emerald-400 font-semibold">{fps}</span> FPS
          </div>
        </div>
      </div>
    </header>
  );
};
