/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameEngine } from './game/Engine';
import { GameState, GameOverData, EventStatus, GameSettings } from './game/types';
import { soundFX } from './game/SoundFX';
import { storage } from './game/Storage';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { EventWarningModal } from './components/EventWarningModal';
import { TransparentCountdownOverlay } from './components/TransparentCountdownOverlay';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<GameSettings>(() => storage.getSettings());

  const [dashEnergy, setDashEnergy] = useState<number>(100);
  const [fps, setFps] = useState<number>(60);
  const [speed, setSpeed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => storage.getHighScore());
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [multiplierProgress, setMultiplierProgress] = useState<number>(0);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [eventStatus, setEventStatus] = useState<EventStatus | undefined>(undefined);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);

  const engineRef = useRef<GameEngine | null>(null);

  // Initialize audio settings on start
  useEffect(() => {
    soundFX.setVolumes(settings.masterVolume, settings.sfxVolume);
  }, [settings.masterVolume, settings.sfxVolume]);

  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
    // Keep engine paused in background while at MENU
    engine.setState('MENU');
  }, []);

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  const handleStatsUpdate = useCallback(
    (stats: {
      dashEnergy: number;
      fps: number;
      speed: number;
      score: number;
      bestScore: number;
      multiplier: number;
      multiplierProgress: number;
      survivalTime: number;
      eventStatus: EventStatus;
    }) => {
      setDashEnergy(stats.dashEnergy);
      setFps(stats.fps);
      setSpeed(stats.speed);
      setScore(stats.score);
      setBestScore(stats.bestScore);
      setMultiplier(stats.multiplier);
      setMultiplierProgress(stats.multiplierProgress);
      setSurvivalTime(stats.survivalTime);
      setEventStatus(stats.eventStatus);
    },
    []
  );

  const handleGameOver = useCallback((data: GameOverData) => {
    setGameOverData(data);
    setGameState('GAMEOVER');
  }, []);

  const handleStartPlay = useCallback(() => {
    setShowHowToPlay(false);
    setShowSettings(false);
    setGameOverData(null);
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
    setGameState('PLAYING');
  }, []);

  const handleTogglePause = useCallback(() => {
    if (engineRef.current && gameState !== 'GAMEOVER' && gameState !== 'MENU') {
      engineRef.current.togglePause();
    }
  }, [gameState]);

  const handleRestartRun = useCallback(() => {
    setShowHowToPlay(false);
    setShowSettings(false);
    setGameOverData(null);
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
    setGameState('PLAYING');
  }, []);

  const handleGoToMainMenu = useCallback(() => {
    setShowHowToPlay(false);
    setShowSettings(false);
    setGameOverData(null);
    if (engineRef.current) {
      engineRef.current.setState('MENU');
    }
    setGameState('MENU');
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundFX.setMuted(next);
      return next;
    });
  }, []);

  const handleUpdateSettings = useCallback((partial: Partial<GameSettings>) => {
    const updated = storage.updateSettings(partial);
    setSettings(updated);
    if (partial.selectedSkin && engineRef.current) {
      engineRef.current.applySkin(partial.selectedSkin);
    }
  }, []);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'MENU') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleStartPlay();
        }
        return;
      }

      if (gameState === 'PLAYING' && eventStatus?.isWarning) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          engineRef.current?.skipEventWarning();
          return;
        }
      }

      if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      } else if (e.key.toLowerCase() === 'r' && gameState !== 'GAMEOVER') {
        handleRestartRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute, handleRestartRun, handleStartPlay, gameState, eventStatus?.isWarning]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top HUD Header (Active during gameplay and pause) */}
      {gameState !== 'MENU' && (
        <HUD
          gameState={gameState}
          dashEnergy={dashEnergy}
          fps={fps}
          speed={speed}
          score={score}
          bestScore={bestScore}
          multiplier={multiplier}
          multiplierProgress={multiplierProgress}
          survivalTime={survivalTime}
          isMuted={isMuted}
          eventStatus={eventStatus}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onReset={handleRestartRun}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Main 60 FPS Simulation Canvas */}
      <GameCanvas
        onEngineReady={handleEngineReady}
        callbacks={{
          onStateChange: handleStateChange,
          onStatsUpdate: handleStatsUpdate,
          onGameOver: handleGameOver,
        }}
      />

      {/* Virtual Touch Controls on mobile */}
      {gameState === 'PLAYING' && (
        <MobileControls
          input={engineRef.current ? engineRef.current.input : null}
          dashEnergy={dashEnergy}
        />
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={bestScore}
          bestTime={storage.getBestSurvivalTime()}
          totalGames={storage.getTotalGames()}
          onPlay={handleStartPlay}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Dynamic Arena Event Warning - Briefing Phase (First 5 seconds) */}
      {gameState === 'PLAYING' && eventStatus?.isWarning && !eventStatus.isTransparentPhase && (
        <EventWarningModal
          eventStatus={eventStatus}
          onSkip={() => engineRef.current?.skipEventWarning()}
          onRestart={handleRestartRun}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Dynamic Arena Event Warning - Transparent Battlefield Recon Phase (Last 2 seconds) */}
      {gameState === 'PLAYING' && eventStatus?.isWarning && eventStatus.isTransparentPhase && (
        <TransparentCountdownOverlay
          eventStatus={eventStatus}
          onSkip={() => engineRef.current?.skipEventWarning()}
          onRestart={handleRestartRun}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Pause Modal Overlay */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleTogglePause}
          onReset={handleRestartRun}
          onMainMenu={handleGoToMainMenu}
          onOpenSettings={() => setShowSettings(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Summary Modal */}
      {gameState === 'GAMEOVER' && gameOverData && (
        <GameOverModal
          data={gameOverData}
          onRestart={handleRestartRun}
          onMainMenu={handleGoToMainMenu}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Settings Modal (Always layered on top) */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          highScore={bestScore}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
