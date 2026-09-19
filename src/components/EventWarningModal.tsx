import React from 'react';
import {
  AlertTriangle,
  Zap,
  Minimize2,
  Compass,
  Shield,
  Moon,
  Play,
  RotateCcw,
  Settings,
  Radio,
  Clock,
} from 'lucide-react';
import { EventStatus, GameEventType } from '../game/types';

interface EventWarningModalProps {
  eventStatus: EventStatus;
  onSkip?: () => void;
  onRestart?: () => void;
  onOpenSettings?: () => void;
}

export const EventWarningModal: React.FC<EventWarningModalProps> = ({
  eventStatus,
  onSkip,
  onRestart,
  onOpenSettings,
}) => {
  const getEventIcon = (type: GameEventType | null) => {
    switch (type) {
      case 'SPEED_SURGE':
        return <Zap className="w-7 h-7 text-amber-400" />;
      case 'SHRINKING_ARENA':
        return <Minimize2 className="w-7 h-7 text-rose-400" />;
      case 'GRAVITY_VORTEX':
        return <Compass className="w-7 h-7 text-purple-400" />;
      case 'SAFE_ZONE':
        return <Shield className="w-7 h-7 text-emerald-400" />;
      case 'DARKNESS':
        return <Moon className="w-7 h-7 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-7 h-7 text-amber-400" />;
    }
  };

  // Briefing countdown from 8 down to 4 (5 seconds)
  const remainingBriefing = Math.max(0, eventStatus.durationRemaining - 3.0);
  const briefingSeconds = Math.max(4, Math.min(8, Math.ceil(eventStatus.durationRemaining)));
  const briefingProgressPercent = Math.max(0, Math.min(100, (remainingBriefing / 5.0) * 100));

  return (
    <div
      id="event-warning-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl p-5 sm:p-7 border shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-5"
        style={{
          backgroundColor: 'rgba(10, 15, 30, 0.96)',
          borderColor: `${eventStatus.color}99`,
          boxShadow: `0 0 50px -10px ${eventStatus.color}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        {/* Top ambient color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            backgroundColor: eventStatus.color,
            boxShadow: `0 0 12px ${eventStatus.color}`,
          }}
        />

        {/* Top Bar: Alert badge + Game Paused Indicator + Action Buttons */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider font-extrabold text-slate-300">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>ARENA TELEGRAPH • GAME PAUSED</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSkip && (
              <button
                id="warning-engage-btn"
                onClick={onSkip}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 hover:text-white border border-sky-400/40 transition-colors cursor-pointer"
                title="Skip countdown and start immediately (Space)"
              >
                <span>ENGAGE</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            )}

            {onRestart && (
              <button
                id="warning-restart-btn"
                onClick={onRestart}
                className="p-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Restart Run (R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenSettings && (
              <button
                id="warning-settings-btn"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Settings & Ship Skins"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Section: Countdown Digits & Event Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-slate-900/60 rounded-xl p-4 border border-slate-800/90">
          {/* Giant Countdown Display */}
          <div
            className="flex flex-col items-center justify-center shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 relative shadow-inner overflow-hidden"
            style={{
              backgroundColor: `${eventStatus.color}14`,
              borderColor: eventStatus.color,
              boxShadow: `0 0 25px -4px ${eventStatus.color}66`,
            }}
          >
            <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-0.5">
              STARTS IN
            </div>
            {/* Pulsing countdown second (8, 7, 6, 5, 4) */}
            <div
              key={briefingSeconds}
              className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white animate-in zoom-in-50 duration-200"
              style={{
                textShadow: `0 0 20px ${eventStatus.color}`,
              }}
            >
              {briefingSeconds}
            </div>
            <div className="text-[9px] font-mono tracking-wider font-semibold text-sky-400">
              3s RECON AT 3
            </div>
          </div>

          {/* Event Identity Information */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="p-1.5 rounded-lg border flex items-center justify-center"
                style={{
                  backgroundColor: `${eventStatus.color}22`,
                  borderColor: `${eventStatus.color}55`,
                }}
              >
                {getEventIcon(eventStatus.type)}
              </div>
              <span
                className="text-xs font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${eventStatus.color}22`,
                  color: eventStatus.color,
                }}
              >
                {eventStatus.tagline || 'DYNAMIC HAZARD'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {eventStatus.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-snug">
              {eventStatus.description}
            </p>
          </div>
        </div>

        {/* Dedicated "WHAT WILL HAPPEN" Tactical Briefing */}
        <div className="flex flex-col gap-2 bg-slate-900/40 rounded-xl p-3.5 sm:p-4 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WHAT WILL HAPPEN:</span>
          </div>

          <div className="flex flex-col gap-2 text-xs sm:text-[13px] text-slate-200">
            {eventStatus.details && eventStatus.details.length > 0 ? (
              eventStatus.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 leading-relaxed"
                >
                  <span className="text-slate-200">{detail}</span>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                {eventStatus.description}
              </div>
            )}
          </div>
        </div>

        {/* Shrinking 5-Second Briefing Progress Bar (8 down to 4) */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>TACTICAL BRIEFING TIMER</span>
            </span>
            <span className="font-mono font-bold text-white tracking-wider">
              {remainingBriefing.toFixed(1)}s (3s Recon follows)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative shadow-inner">
            {/* Interval Ticks */}
            <div className="absolute inset-0 flex justify-between px-[20%] pointer-events-none z-10 opacity-35">
              <div className="w-px h-full bg-white" />
              <div className="w-px h-full bg-white" />
              <div className="w-px h-full bg-white" />
              <div className="w-px h-full bg-white" />
            </div>

            {/* Shrinking Fill Bar */}
            <div
              className="h-full rounded-full transition-all duration-75 ease-linear relative overflow-hidden"
              style={{
                width: `${briefingProgressPercent}%`,
                backgroundColor: eventStatus.color,
                boxShadow: `0 0 12px ${eventStatus.color}`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold px-1">
            <span>8s</span>
            <span>7s</span>
            <span>6s</span>
            <span>5s</span>
            <span>4s</span>
            <span className="text-sky-400 font-bold">3s RECON PREVIEW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

