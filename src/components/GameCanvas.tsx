import React, { useEffect, useRef } from 'react';
import { GameEngine, EngineCallbacks } from '../game/Engine';

interface GameCanvasProps {
  onEngineReady: (engine: GameEngine) => void;
  callbacks: EngineCallbacks;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineReady, callbacks }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Instantiate engine
    const engine = new GameEngine(canvas, callbacks);
    engineRef.current = engine;
    onEngineReady(engine);
    engine.start();

    // Resize observer to auto-adapt resolution and arena
    const resizeObserver = new ResizeObserver(() => {
      engine.handleResize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none select-none"
      />
    </div>
  );
};
