import React from 'react';
import { Play, RotateCcw, Settings, Radio } from 'lucide-react';
import { EventStatus } from '../game/types';

interface TransparentCountdownOverlayProps {
  eventStatus: EventStatus;
  onSkip: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const TransparentCountdownOverlay: React.FC<TransparentCountdownOverlayProps> = ({
  eventStatus,
  onSkip,
  onRestart,
  onOpenSettings,
}) => {
  const secondsLeft = Math.max(1, Math.min(3, Math.ceil(eventStatus.durationRemaining)));

  return (
    <div
      id="transparent-countdown-overlay"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-150"
    >
      {/* Top Floating Action Bar (Pointer events enabled for interactive buttons) */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/70 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: eventStatus.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: eventStatus.color }}
            />
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-slate-200 truncate">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">RECON: {eventStatus.name}</span>
          </div>
        </div>

        {/* Quick Action Buttons: Engage, Restart, Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="recon-skip-btn"
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 border border-sky-400/40 hover:border-sky-300 transition-all cursor-pointer"
            title="Skip countdown and start immediately (Space)"
          >
            <span>ENGAGE (SPACE)</span>
            <Play className="w-3 h-3 fill-current" />
          </button>

          <button
            id="recon-restart-btn"
            onClick={onRestart}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Restart Run (R)"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">RESTART</span>
          </button>

          <button
            id="recon-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Settings & Ship Skins"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Massive Central Heads-Up Countdown Readout */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="relative flex flex-col items-center justify-center">
          {/* Glowing countdown numeral */}
          <div
            key={secondsLeft}
            className="text-8xl sm:text-9xl font-black font-mono tracking-tighter leading-none text-white drop-shadow-2xl animate-in zoom-in-75 duration-200"
            style={{
              textShadow: `0 0 40px ${eventStatus.color}, 0 0 80px ${eventStatus.color}66`,
            }}
          >
            {secondsLeft}
          </div>

          <div
            className="mt-3 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono font-black uppercase tracking-widest border backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: 'rgba(2, 6, 23, 0.85)',
              borderColor: `${eventStatus.color}88`,
              color: eventStatus.color,
              boxShadow: `0 0 20px ${eventStatus.color}44`,
            }}
          >
            {secondsLeft === 3
              ? 'BATTLEFIELD RECON • ASSESS POSITIONS'
              : secondsLeft === 2
              ? 'IDENTIFY HAZARDS • PREPARE EVASION'
              : 'GET READY • ARENA RECONFIGURING'}
          </div>
        </div>
      </div>

      {/* Bottom Situational Awareness Hint */}
      <div className="w-full text-center pb-2">
        <span className="font-mono text-xs text-slate-400 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800/80">
          Target reticles highlight <span className="text-sky-400 font-bold">YOUR SHIP</span> and <span className="text-rose-400 font-bold">HAZARD TRAJECTORIES</span>
        </span>
      </div>
    </div>
  );
};
