import React from 'react';
import { Play, HelpCircle, Settings, Trophy, Zap, Shield, Flame } from 'lucide-react';
import { soundFX } from '../game/SoundFX';

interface MainMenuProps {
  highScore: number;
  bestTime: number;
  totalGames: number;
  onPlay: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  bestTime,
  totalGames,
  onPlay,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = () => {
    soundFX.playDash();
    onPlay();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
      {/* Top Bar: Telemetry Stats */}
      <div className="w-full max-w-md flex items-center justify-between font-mono text-xs text-slate-400">
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-500">BEST:</span>
          <span className="text-white font-bold">{highScore.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">TIME:</span>
          <span className="text-white font-bold">{formatTime(bestTime)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">RUNS:</span>
          <span className="text-white font-bold">{totalGames}</span>
        </div>
      </div>

      {/* Center Branding & Hero Core */}
      <div className="flex flex-col items-center justify-center my-auto py-6">
        {/* Animated geometric emblem */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-sky-400/30 animate-ping absolute" />
          <div className="w-20 h-20 rounded-full border border-sky-400/60 flex items-center justify-center bg-slate-900/80 shadow-[0_0_24px_rgba(56,189,248,0.4)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-200 animate-pulse shadow-[0_0_16px_rgba(56,189,248,0.8)]" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase text-center mb-2 drop-shadow-md">
          ONE MORE
        </h1>
        <p className="font-mono text-xs sm:text-sm text-sky-400/90 tracking-widest uppercase text-center mb-8">
          Survive • Collect • Graze • Adapt
        </p>

        {/* Primary Action Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            id="menu-play-btn"
            onClick={handlePlayClick}
            className="group relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(56,189,248,0.45)] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY NOW</span>
            <span className="text-[10px] font-mono font-normal opacity-75 hidden sm:inline ml-1">(SPACE)</span>
          </button>

          <button
            id="menu-how-to-play-btn"
            onClick={onOpenHowToPlay}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-semibold text-sm tracking-wide transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            id="menu-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-semibold text-sm tracking-wide transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>SETTINGS & SHIPS</span>
          </button>
        </div>
      </div>

      {/* Bottom Feature Tags */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-sky-400" /> PHASE DASH
        </span>
        <span className="text-slate-700">•</span>
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> 10X COMBOS
        </span>
        <span className="text-slate-700">•</span>
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> 5 DYNAMIC EVENTS
        </span>
      </div>
    </div>
  );
};
