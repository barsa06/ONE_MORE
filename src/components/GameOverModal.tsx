import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { GameOverData } from '../game/types';

interface GameOverModalProps {
  data: GameOverData;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ data, onRestart, onMainMenu }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        <span className="text-xs uppercase font-mono tracking-widest text-rose-400 font-bold mb-1">
          FATAL COLLISION
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wider mb-5">
          GAME OVER
        </h2>

        {/* Score Card */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-5 relative">
          {data.isNewBest && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-lg shadow-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              NEW HIGH SCORE
            </div>
          )}
          <span className="text-xs uppercase font-mono text-slate-400 block mb-1">FINAL SCORE</span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight">
            {data.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>BEST: <strong className="text-slate-200">{data.bestScore.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Run Telemetry Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-6 text-left font-mono">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>SURVIVED</span>
            </div>
            <div className="text-sm font-bold text-slate-100">{formatTime(data.survivalTime)}</div>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>SPARKS</span>
            </div>
            <div className="text-sm font-bold text-slate-100">{data.sparksCollected}</div>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
              <ShieldCheck className="w-3 h-3 text-violet-400" />
              <span>GRAZES</span>
            </div>
            <div className="text-sm font-bold text-slate-100">{data.grazesCount}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="gameover-restart-btn"
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (SPACE)</span>
          </button>

          <button
            id="gameover-menu-btn"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs tracking-wider uppercase border border-slate-800 transition-all cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
