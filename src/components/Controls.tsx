import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

interface ControlsProps {
  isRunning: boolean;
  time: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onLap: () => void;
}

export default function Controls({ isRunning, time, onStart, onStop, onReset, onLap }: ControlsProps) {
  const { settings, resetForceState, setLongPressForceActive, resetBirthdayData } = useSettings();
  const isStarted = time > 0;
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleStartPressDown = () => {
    if (settings.longPressStartToForce && !isRunning) {
      longPressTimer.current = setTimeout(() => {
        setLongPressForceActive(true);
        onStart(); // Automatically start after 1s
        longPressTimer.current = null;
      }, 1000);
    }
  };

  const handleStartPressUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleResetPressDown = () => {
    if (!isRunning && isStarted) {
      longPressTimer.current = setTimeout(() => {
        if (settings.resetForceOnLongPress) {
          resetForceState();
        }
        // Requirement 1: Long press Reset button to clear birthday reveal values
        resetBirthdayData();
        
        onReset(); // Visual feedback of reset
        longPressTimer.current = null;
      }, 1000);
    }
  };

  const handleResetPressUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="flex justify-center items-center gap-16 px-8 py-12 w-full max-w-md mx-auto select-none">
      {/* Left Button: Parziale / Reimposta */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseDown={handleResetPressDown}
        onMouseUp={handleResetPressUp}
        onTouchStart={handleResetPressDown}
        onTouchEnd={handleResetPressUp}
        onClick={isRunning ? onLap : onReset}
        disabled={!isStarted}
        className={`w-32 h-11 rounded-full text-base font-medium transition-colors ${
          isStarted 
            ? 'bg-zinc-800 text-white active:bg-zinc-700' 
            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
        }`}
      >
        {isRunning ? 'Parziale' : 'Reimposta'}
      </motion.button>

      {/* Right Button: Inizia / Stop / Riprendi */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseDown={handleStartPressDown}
        onMouseUp={handleStartPressUp}
        onTouchStart={handleStartPressDown}
        onTouchEnd={handleStartPressUp}
        onClick={isRunning ? onStop : onStart}
        className={`w-32 h-11 rounded-full text-base font-medium transition-colors ${
          isRunning 
            ? 'bg-red-600 text-white active:bg-red-700' 
            : isStarted 
              ? 'bg-indigo-600 text-white active:bg-indigo-700'
              : 'bg-indigo-600 text-white active:bg-indigo-700'
        }`}
      >
        {isRunning ? 'Stop' : isStarted ? 'Riprendi' : 'Inizia'}
      </motion.button>
    </div>
  );
}
