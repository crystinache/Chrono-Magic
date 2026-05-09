import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export interface Lap {
  id: number;
  time: number;
}

export function useStopwatch() {
  const { 
    settings, 
    forceState, 
    incrementStopCount, 
    incrementResetCount, 
    incrementLapCount, 
    consumeForcePair,
    incrementBirthdayStop
  } = useSettings();

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const update = useCallback(() => {
    const now = Date.now();
    const realElapsed = now - startTimeRef.current;
    const virtualElapsed = realElapsed / settings.chronoSpeed;
    const totalVirtual = accumulatedTimeRef.current + virtualElapsed;
    setTime(totalVirtual);
    requestRef.current = requestAnimationFrame(update);
  }, [settings.chronoSpeed]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(update);
  }, [isRunning, update]);

  const applyForce = useCallback((action: 'Stop' | 'Lap', currentTime: number) => {
    if (!settings.isActive || forceState.isForcingComplete) return currentTime;

    // Check "Force After" condition
    let conditionMet = false;
    
    if (settings.longPressStartToForce) {
      // If long press start is enabled, we only force if the long press flag is active
      conditionMet = forceState.isLongPressForceActive;
    } else {
      // Normal "Force After" logic
      switch (settings.forceAfterUnit) {
        case 'seconds':
          conditionMet = currentTime >= settings.forceAfterValue * 1000;
          break;
        case 'stops':
          conditionMet = forceState.stopCount >= settings.forceAfterValue;
          break;
        case 'resets':
          conditionMet = forceState.resetCount >= settings.forceAfterValue;
          break;
        case 'laps':
          conditionMet = forceState.lapCount >= settings.forceAfterValue;
          break;
      }
    }

    if (!conditionMet) return currentTime;

    // Check "Force On" condition
    const canForceOnAction = 
      settings.forceOn === 'Either' || 
      settings.forceOn === (action as any);

    if (!canForceOnAction) return currentTime;

    const pair = consumeForcePair();
    if (!pair) return currentTime;

    const val = parseInt(pair, 10);
    let newTime = currentTime;

    switch (settings.forceType) {
      case 'ms': {
        const totalSeconds = Math.floor(currentTime / 1000);
        newTime = (totalSeconds * 1000) + (val * 10);
        break;
      }
      case 'sec+ms': {
        const currentSeconds = Math.floor((currentTime % 60000) / 1000);
        const minutes = Math.floor(currentTime / 60000);
        let forcedMs = val - currentSeconds;
        if (forcedMs < 0) forcedMs = 0;
        if (forcedMs > 99) forcedMs = 99;
        newTime = (minutes * 60000) + (currentSeconds * 1000) + (forcedMs * 10);
        break;
      }
      case 'sec:ms': {
        const forcedSeconds = Math.floor(val / 100);
        const forcedMs = val % 100;
        const minutes = Math.floor(currentTime / 60000);
        newTime = (minutes * 60000) + (forcedSeconds * 1000) + (forcedMs * 10);
        break;
      }
    }

    return newTime;
  }, [settings, forceState, consumeForcePair]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    const virtualElapsed = (Date.now() - startTimeRef.current) / settings.chronoSpeed;
    const currentVirtualTime = accumulatedTimeRef.current + virtualElapsed;
    
    const forcedTime = applyForce('Stop', currentVirtualTime);
    
    setTime(forcedTime);
    accumulatedTimeRef.current = forcedTime;
    
    setIsRunning(false);
    incrementStopCount();

    if (settings.birthdayRevealActive) {
      const seconds = Math.floor((forcedTime % 60000) / 1000);
      incrementBirthdayStop(seconds);
    }
  }, [isRunning, applyForce, incrementStopCount, settings.chronoSpeed, settings.birthdayRevealActive, incrementBirthdayStop]);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
    incrementResetCount();
  }, [incrementResetCount]);

  const lap = useCallback(() => {
    const virtualElapsed = (Date.now() - startTimeRef.current) / settings.chronoSpeed;
    const currentVirtualTime = accumulatedTimeRef.current + virtualElapsed;
    
    const forcedTime = applyForce('Lap', currentVirtualTime);
    const finalTime = forcedTime;
    
    setTime(forcedTime);
    accumulatedTimeRef.current = forcedTime;
    startTimeRef.current = Date.now();

    const newLap: Lap = {
      id: laps.length + 1,
      time: finalTime,
    };
    
    setLaps([newLap, ...laps]);
    incrementLapCount();
  }, [laps, applyForce, incrementLapCount, settings.chronoSpeed]);

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(2, '0'),
    };
  }, []);

  return {
    time,
    isRunning,
    laps,
    start,
    stop,
    reset,
    lap,
    formatTime,
  };
}
