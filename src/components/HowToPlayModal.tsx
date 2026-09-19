import React from 'react';
import { X, Zap, Target, Flame, Shield, AlertTriangle, Crosshair, Compass, Moon, Activity } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-black tracking-wide text-white uppercase">HOW TO PLAY</h2>
          </div>
          <button
            id="how-to-play-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm">
          {/* Section 1: Objective & Controls */}
          <div>
            <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 01. OBJECTIVE & CONTROLS
            </h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              Pilot your energy core inside the hazardous containment arena. Evade lethal threats, collect sparks to ratchet up your score multiplier, and survive as long as possible.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">MOVE</span>
                <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded">WASD / ARROWS</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">PHASE DASH</span>
                <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded">SPACE / SHIFT</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">PAUSE</span>
                <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded">ESC / P</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">TOUCH / MOBILE</span>
                <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded">STICK + DASH BTN</span>
              </div>
            </div>
          </div>

          {/* Section 2: Phase Dash & Graze */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" /> 02. PHASE DASH & GRAZE MECHANICS
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-white font-semibold">Phase Dash (Invulnerability):</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Consumes 35% Dash Energy to teleport forward with pure invulnerability frames. Pass directly through enemies and laser beams to escape tight pinches.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-white font-semibold">Graze (Close Calls):</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Skim within 28px of a lethal enemy without dying to trigger a Graze. Earns +75 instant bonus points and recharges a burst of dash energy.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Multipliers & Pickups */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> 03. PICKUPS & MULTIPLIERS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  <span className="font-bold text-white">Spark Orb (+100 pts)</span>
                </div>
                <p className="text-slate-400">Regular energy node. Keeps combo alive and raises multiplier by +0.2x.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="font-bold text-white">Prism (+500 pts)</span>
                </div>
                <p className="text-slate-400">Rare crystalline node. Grants +0.5x combo and refills 40 dash energy.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-2">
              ⚠️ Combos expire if 2.5 seconds pass without collecting a pickup. Chain pickups to reach the 10.0x cap!
            </p>
          </div>

          {/* Section 4: Enemy Types */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> 04. THREAT MATRIX
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 rotate-45 bg-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-white">Drifter (Ruby Diamond):</span>
                  <p className="text-slate-400 mt-0.5">Relentlessly tracks your coordinates. Smooth pursuit curve.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 bg-rose-400 shrink-0 [clip-path:polygon(100%_50%,0_0,40%_50%,0_100%)]" />
                <div>
                  <span className="font-bold text-white">Dart (Chevron Interceptor):</span>
                  <p className="text-slate-400 mt-0.5">Locks on with a high-intensity laser telegraph, then rocket dashes across the arena.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-orange-500 shrink-0" />
                <div>
                  <span className="font-bold text-white">Orbital (Sawblade Hazard):</span>
                  <p className="text-slate-400 mt-0.5">Continuously ricochets off the perimeter walls at high diagonal velocity.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Dynamic Events */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> 05. DYNAMIC ARENA EVENTS
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Every 20–30 seconds, the game pauses for an 8-second tactical preparation: 5 seconds of event briefing (8, 7, 6, 5, 4) followed by a 3-second transparent battlefield recon countdown (3, 2, 1) before the hazard begins:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-amber-300">Speed Surge:</strong> Enemies +35% speed, Score doubled (2x).</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong className="text-rose-300">Shrinking Arena:</strong> Borders contract inward by 22%.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong className="text-purple-300">Gravity Vortex:</strong> Singularity pulls avatar to center.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-emerald-300">Sanctuary Dome:</strong> Repels enemies + bonus points.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2 sm:col-span-2">
                <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong className="text-cyan-300">Nightfall:</strong> Total arena darkness with personal radial spotlight.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            id="how-to-play-got-it-btn"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            GOT IT, LET'S PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
