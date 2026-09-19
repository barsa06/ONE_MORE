import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Keyboard, Settings, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onReset: () => void;
  onMainMenu: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onReset,
  onMainMenu,
  onOpenSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-40 p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <span className="text-xs uppercase font-mono tracking-widest text-sky-400 font-semibold mb-1">
          Simulation Suspended
        </span>
        <h2 className="text-2xl font-black text-white tracking-wide mb-5">GAME PAUSED</h2>

        <div className="w-full space-y-2 mb-5">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME (ESC)</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={onReset}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART RUN (R)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="pause-settings-btn"
              onClick={onOpenSettings}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>SETTINGS</span>
            </button>

            <button
              id="pause-mute-btn"
              onClick={onToggleMute}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
              <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
            </button>
          </div>

          <button
            id="pause-main-menu-btn"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>

        {/* Controls Reference */}
        <div className="w-full pt-4 border-t border-slate-800/80 text-left">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-mono">
            <Keyboard className="w-3.5 h-3.5" />
            <span>CONTROLS CHEAT SHEET</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block text-[10px]">MOVE</span>
              WASD / Arrows
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block text-[10px]">DASH / BURST</span>
              Space / Shift
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

