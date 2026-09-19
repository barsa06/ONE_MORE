import React, { useRef, useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { InputManager } from '../game/Input';

interface MobileControlsProps {
  input: InputManager | null;
  dashEnergy: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ input, dashEnergy }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickOrigin, setStickOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stickCurrent, setStickCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickTouchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch capability or small screen
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 800) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!input || joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;

    setStickOrigin({ x: touch.clientX, y: touch.clientY });
    setStickCurrent({ x: touch.clientX, y: touch.clientY });
    setJoystickActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!input || joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - stickOrigin.x;
        const dy = touch.clientY - stickOrigin.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 50;

        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const currentX = stickOrigin.x + Math.cos(angle) * clampedDist;
        const currentY = stickOrigin.y + Math.sin(angle) * clampedDist;

        setStickCurrent({ x: currentX, y: currentY });

        // Normalize -1 to 1 for input
        const normalizedX = (Math.cos(angle) * clampedDist) / maxRadius;
        const normalizedY = (Math.sin(angle) * clampedDist) / maxRadius;
        input.setTouchVector(normalizedX, normalizedY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickActive(false);
        if (input) {
          input.setTouchVector(0, 0);
        }
        break;
      }
    }
  };

  if (!isTouchDevice) {
    return null;
  }

  const canDash = dashEnergy >= 35;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Left Touch Joystick Pad Area */}
      <div
        id="mobile-joystick-zone"
        className="absolute bottom-4 left-4 w-1/2 h-1/2 pointer-events-auto touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Floating Joystick Visuals */}
        {joystickActive && (
          <div
            className="fixed w-28 h-28 -ml-14 -mt-14 rounded-full border-2 border-sky-400/40 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center pointer-events-none"
            style={{ left: stickOrigin.x, top: stickOrigin.y }}
          >
            <div
              className="w-12 h-12 rounded-full bg-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.8)] pointer-events-none"
              style={{
                transform: `translate(${stickCurrent.x - stickOrigin.x}px, ${stickCurrent.y - stickOrigin.y}px)`,
              }}
            />
          </div>
        )}

        {!joystickActive && (
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full border-2 border-dashed border-slate-700/60 bg-slate-900/20 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">MOVE</span>
          </div>
        )}
      </div>

      {/* Right Touch Dash Button */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <button
          id="mobile-dash-btn"
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            if (input && canDash) {
              input.triggerTouchDash();
            }
          }}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all active:scale-95 ${
            canDash
              ? 'bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-sky-500/30 border-2 border-sky-300'
              : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
          }`}
        >
          <Zap className={`w-6 h-6 ${canDash ? 'text-white fill-white' : 'text-slate-600'}`} />
          <span className="font-mono text-[11px] tracking-wider mt-0.5">DASH</span>
        </button>
      </div>
    </div>
  );
};
