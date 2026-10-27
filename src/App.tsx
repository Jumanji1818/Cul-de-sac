/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, EngineCallbacks, LEVELS } from './game/engine';
import { GameMode, GameState, GameStats, MischiefObjective, GadgetItem, CompanionCommand, LevelConfig } from './game/types';
import { audio } from './game/audio';
import { createInitialGadgets } from './game/gadgets';
import { loadSettings, loadProgress, PlayerSettings, GameProgress } from './game/storage';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { ClubhouseModal } from './components/ClubhouseModal';
import { PhotoModeModal } from './components/PhotoModeModal';
import { ChallengeCreatorModal } from './components/ChallengeCreatorModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistence & Settings
  const [settings, setSettings] = useState<PlayerSettings>(loadSettings);
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isClubhouseOpen, setIsClubhouseOpen] = useState<boolean>(false);
  const [isPhotoModeOpen, setIsPhotoModeOpen] = useState<boolean>(false);
  const [isChallengeCreatorOpen, setIsChallengeCreatorOpen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // React states for UI overlays
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('SOLO');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [peaceLevel, setPeaceLevel] = useState<number>(100);
  const [wantedStars, setWantedStars] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [objectives, setObjectives] = useState<MischiefObjective[]>(LEVELS[0].objectives);
  const [activeGadget, setActiveGadget] = useState<GadgetItem>(() => createInitialGadgets().decoy);
  const [companionCommand, setCompanionCommand] = useState<CompanionCommand>('FOLLOW');
  const [cameraMode, setCameraMode] = useState<'OVERVIEW' | 'FOLLOW'>('OVERVIEW');
  const [medal, setMedal] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [isMuted, setIsMuted] = useState<boolean>(() => settings.isMuted);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [lastStats, setLastStats] = useState<GameStats>({
    trashCansKicked: 0,
    doorbellsDitched: 0,
    carAlarmsTriggered: 0,
    flamingosFlung: 0,
    sprinklersCranked: 0,
    tpRollsThrown: 0,
    highFivesShared: 0,
    neighborsEvaded: 0,
    totalChaosScore: 0,
    chainReactions: 0,
    gadgetsUsed: 0,
    bananaSlips: 0,
    carsSprayed: 0,
  });

  // Detect touch device
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Sync Audio Settings
  useEffect(() => {
    audio.setMuted(settings.isMuted);
    audio.setSfxVolume(settings.sfxVolume);
    audio.setMusicVolume(settings.musicVolume);
    setIsMuted(settings.isMuted);
  }, [settings.isMuted, settings.sfxVolume, settings.musicVolume]);

  // Callbacks passed to simulation engine
  const callbacks: EngineCallbacks = {
    onScoreUpdate: useCallback((s, c, p, w, gadget, command, camMode) => {
      setScore(s);
      setCombo(c);
      setPeaceLevel(p);
      setWantedStars(w);
      if (gadget) setActiveGadget({ ...gadget });
      if (command) setCompanionCommand(command);
      if (camMode) setCameraMode(camMode);
    }, []),
    onObjectivesUpdate: useCallback((objs, tl) => {
      setObjectives([...objs]);
      setTimeLeft(tl);
    }, []),
    onLevelComplete: useCallback((stats, lvl, earnedMedal) => {
      setLastStats({ ...stats });
      setCurrentLevel(lvl);
      setMedal(earnedMedal);
      setGameState('VICTORY');
      setProgress(loadProgress());
    }, []),
    onGameOver: useCallback((stats, reason) => {
      setLastStats({ ...stats });
      setGameOverReason(reason);
      setGameState('BUSTED');
      setProgress(loadProgress());
    }, []),
  };

  // Mount engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (engineRef.current) {
        engineRef.current.resize(canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const engine = new GameEngine(canvas, callbacks);
    engine.setEquippedHats(progress.selectedHatLeo, progress.selectedHatMilo);
    engineRef.current = engine;

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update engine when equipped hats change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setEquippedHats(progress.selectedHatLeo, progress.selectedHatMilo);
    }
  }, [progress.selectedHatLeo, progress.selectedHatMilo]);

  // Sync all player settings (atmosphere, weather, audio, controls) to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.applySettings(settings);
    }
  }, [settings]);

  // Global keybinds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'TITLE' && !isSettingsOpen) {
        if (e.code === 'Enter' || e.code === 'Space') {
          handleStartGame();
        }
      } else if (gameState === 'PLAYING') {
        if (e.code === 'Escape') {
          handlePause();
        }
      } else if (gameState === 'PAUSED') {
        if (e.code === 'Escape') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, gameMode, currentLevel, isSettingsOpen]);

  // Actions
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.setMode(gameMode);
    engineRef.current.startGame(0);
    setCurrentLevel(0);
    setGameState('PLAYING');
  };

  const handleNextLevel = () => {
    if (!engineRef.current) return;
    const nextLvl = currentLevel + 1;
    setCurrentLevel(nextLvl);
    engineRef.current.startGame(nextLvl);
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    engineRef.current.startGame(currentLevel);
    setGameState('PLAYING');
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseGame();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseGame();
    setGameState('PLAYING');
  };

  const handleTitleMenu = () => {
    if (!engineRef.current) return;
    engineRef.current.state = 'TITLE';
    setGameState('TITLE');
    audio.stopMusic();
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    setSettings((prev) => ({ ...prev, isMuted: muted }));
  };

  const handleSetMode = (mode: GameMode) => {
    setGameMode(mode);
    if (engineRef.current) {
      engineRef.current.setMode(mode);
    }
  };

  const handleToggleCameraMode = () => {
    if (engineRef.current) {
      const newMode = engineRef.current.toggleCameraMode();
      setCameraMode(newMode);
    }
  };

  const handleSnapCamera = () => {
    if (engineRef.current) {
      engineRef.current.snapCameraBehind();
    }
  };

  const handleZoomIn = () => {
    if (engineRef.current) {
      engineRef.current.zoomCamera(-2.5);
    }
  };

  const handleZoomOut = () => {
    if (engineRef.current) {
      engineRef.current.zoomCamera(2.5);
    }
  };

  const handleResetCamera = () => {
    if (engineRef.current) {
      engineRef.current.resetCamera();
      setCameraMode('OVERVIEW');
    }
  };

  const handleStartCustomChallenge = (config: LevelConfig) => {
    if (!engineRef.current) return;
    setIsChallengeCreatorOpen(false);
    engineRef.current.currentLevelConfig = config;
    engineRef.current.startGame(config.levelNumber);
    setObjectives(config.objectives);
    setTimeLeft(config.timeLimit);
    setGameState('PLAYING');
  };

  const showTouchControls = (isTouchDevice || settings.touchControlsEnabled) && gameState === 'PLAYING';

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none">
      {/* 60fps Isolated HTML5 Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair touch-none"
      />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && !isSettingsOpen && !isClubhouseOpen && !isChallengeCreatorOpen && (
        <TitleScreen
          mode={gameMode}
          onSetMode={handleSetMode}
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenClubhouse={() => setIsClubhouseOpen(true)}
          onOpenChallengeCreator={() => setIsChallengeCreatorOpen(true)}
        />
      )}

      {/* Active Game Low-Occlusion HUD */}
      {gameState === 'PLAYING' && !isPhotoModeOpen && (
        <GameHUD
          score={score}
          combo={combo}
          peaceLevel={peaceLevel}
          wantedStars={wantedStars}
          objectives={objectives}
          timeLeft={timeLeft}
          mode={gameMode}
          activeGadget={activeGadget}
          companionCommand={companionCommand}
          cameraMode={cameraMode}
          onToggleCameraMode={handleToggleCameraMode}
          onSnapCamera={handleSnapCamera}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetCamera={handleResetCamera}
          onOpenClubhouse={() => setIsClubhouseOpen(true)}
          onOpenPhotoMode={() => setIsPhotoModeOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Mobile Multi-Touch Virtual Joystick & Action Buttons */}
      {showTouchControls && !isPhotoModeOpen && engineRef.current && (
        <MobileControls
          input={engineRef.current.input}
          activeGadget={activeGadget}
          companionCommand={companionCommand}
          mode={gameMode}
          buttonSize={settings.buttonSize}
          isFloatingJoystick={settings.joystickFloating}
        />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && !isSettingsOpen && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onTitleMenu={handleTitleMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setIsSettingsOpen(true)}
          mode={gameMode}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(gameState === 'BUSTED' || gameState === 'VICTORY') && !isSettingsOpen && (
        <GameOverModal
          isVictory={gameState === 'VICTORY'}
          reason={gameOverReason}
          stats={lastStats}
          currentLevel={currentLevel}
          medal={medal}
          hasNextLevel={gameMode === 'SOLO' && currentLevel < LEVELS.length - 1}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onTitleMenu={handleTitleMenu}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          progress={progress}
          onUpdateSettings={setSettings}
          onUpdateProgress={setProgress}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Secret Clubhouse & Base Modal */}
      {isClubhouseOpen && (
        <ClubhouseModal
          progress={progress}
          onUpdateProgress={setProgress}
          onClose={() => setIsClubhouseOpen(false)}
        />
      )}

      {/* Photo Mode Modal */}
      {isPhotoModeOpen && engineRef.current && (
        <PhotoModeModal
          engine={engineRef.current}
          onClose={() => setIsPhotoModeOpen(false)}
        />
      )}

      {/* Custom Challenge Creator Modal */}
      {isChallengeCreatorOpen && (
        <ChallengeCreatorModal
          onClose={() => setIsChallengeCreatorOpen(false)}
          onStartCustomChallenge={handleStartCustomChallenge}
        />
      )}
    </main>
  );
}
