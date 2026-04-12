import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ForceAfterUnit = 'seconds' | 'stops' | 'resets' | 'laps';
export type ForceOn = 'Stop' | 'Lap' | 'Either';
export type ForceType = 'ms' | 'sec+ms' | 'sec:ms';

interface ForceSettings {
  forceAfterValue: number;
  forceAfterUnit: ForceAfterUnit;
  forceOn: ForceOn;
  forceValue: string; // The raw string of digits
  forceType: ForceType;
  isActive: boolean;
  // General Settings
  resetForceOnLongPress: boolean;
  longPressStartToForce: boolean;
  hideStatusBar: boolean;
  chronoSpeed: number; // Duration of 1 stopwatch second in real seconds
  // Toxic Force
  toxicForceActive: boolean;
  toxicValue: number;
  toxicPairs: string[];
  // Birthday Reveal
  birthdayRevealActive: boolean;
  zodiacRevealActive: boolean;
  famousPersonRevealActive: boolean;
  revealFontColor: string; // Hex or CSS color
}

interface BirthdayData {
  value1: number | null;
  value2: number | null;
  day: number | null;
  month: number | null;
}

interface SettingsContextType {
  settings: ForceSettings;
  updateSettings: (newSettings: Partial<ForceSettings>) => void;
  forceState: {
    stopCount: number;
    resetCount: number;
    lapCount: number;
    currentForceIndex: number; // Index of the pair being used
    isForcingComplete: boolean;
    isLongPressForceActive: boolean;
  };
  birthdayState: {
    data: BirthdayData;
    isRevealed: boolean;
    stopCount: number; // Count of stops for birthday capture
  };
  incrementStopCount: () => void;
  incrementResetCount: () => void;
  incrementLapCount: () => void;
  consumeForcePair: () => string | null;
  resetForceState: () => void;
  setLongPressForceActive: (active: boolean) => void;
  updateBirthdayData: (data: Partial<BirthdayData>) => void;
  setBirthdayRevealed: (revealed: boolean) => void;
  resetBirthdayData: () => void;
  incrementBirthdayStop: (seconds: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ForceSettings>(() => {
    const saved = localStorage.getItem('chrono_settings');
    const defaultSettings = {
      forceAfterValue: 0,
      forceAfterUnit: 'seconds',
      forceOn: 'Stop',
      forceValue: '',
      forceType: 'ms',
      isActive: false,
      resetForceOnLongPress: false,
      longPressStartToForce: false,
      hideStatusBar: false,
      chronoSpeed: 1.0,
      toxicForceActive: false,
      toxicValue: 0,
      toxicPairs: [],
      birthdayRevealActive: false,
      zodiacRevealActive: false,
      famousPersonRevealActive: false,
      revealFontColor: '#ffffff',
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [forceState, setForceState] = useState({
    stopCount: 0,
    resetCount: 0,
    lapCount: 0,
    currentForceIndex: 0,
    isForcingComplete: false,
    isLongPressForceActive: false,
  });

  const [birthdayState, setBirthdayState] = useState<{
    data: BirthdayData;
    isRevealed: boolean;
    stopCount: number;
  }>(() => {
    const saved = localStorage.getItem('chrono_birthday_state');
    const defaultState = {
      data: { value1: null, value2: null, day: null, month: null },
      isRevealed: false,
      stopCount: 0,
    };
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('chrono_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chrono_birthday_state', JSON.stringify(birthdayState));
  }, [birthdayState]);

  const updateSettings = (newSettings: Partial<ForceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateBirthdayData = (data: Partial<BirthdayData>) => {
    setBirthdayState(prev => ({
      ...prev,
      data: { ...prev.data, ...data }
    }));
  };

  const setBirthdayRevealed = (revealed: boolean) => {
    setBirthdayState(prev => ({ ...prev, isRevealed: revealed }));
  };

  const resetBirthdayData = () => {
    setBirthdayState({
      data: { value1: null, value2: null, day: null, month: null },
      isRevealed: false,
      stopCount: 0,
    });
  };

  const incrementBirthdayStop = (seconds: number) => {
    setBirthdayState(prev => {
      if (prev.stopCount === 0) {
        return { ...prev, stopCount: 1, data: { ...prev.data, value1: seconds } };
      } else if (prev.stopCount === 1) {
        return { ...prev, stopCount: 2, data: { ...prev.data, value2: seconds } };
      }
      return prev;
    });
  };

  const incrementStopCount = () => {
    setForceState((prev) => ({ ...prev, stopCount: prev.stopCount + 1 }));
  };

  const incrementResetCount = () => {
    setForceState((prev) => ({ 
      ...prev, 
      resetCount: prev.resetCount + 1,
    }));
  };

  const incrementLapCount = () => {
    setForceState((prev) => ({ ...prev, lapCount: prev.lapCount + 1 }));
  };

  const consumeForcePair = () => {
    const isToxic = settings.toxicForceActive;
    const source = isToxic ? settings.toxicPairs : null;
    const rawValue = settings.forceValue;

    if (forceState.isForcingComplete) return null;

    let pairs: string[] = [];
    if (isToxic) {
      pairs = settings.toxicPairs;
    } else if (rawValue) {
      const digits = rawValue.length % 2 !== 0 ? '0' + rawValue : rawValue;
      pairs = digits.match(/.{1,2}/g) || [];
    }

    if (pairs.length === 0 || forceState.currentForceIndex >= pairs.length) {
      setForceState(prev => ({ ...prev, isForcingComplete: true }));
      return null;
    }

    const pair = pairs[forceState.currentForceIndex];
    setForceState(prev => {
      const nextIndex = prev.currentForceIndex + 1;
      return {
        ...prev,
        currentForceIndex: nextIndex,
        isForcingComplete: nextIndex >= pairs.length
      };
    });
    
    return pair;
  };

  const resetForceState = () => {
    setForceState({
      stopCount: 0,
      resetCount: 0,
      lapCount: 0,
      currentForceIndex: 0,
      isForcingComplete: false,
      isLongPressForceActive: false,
    });
  };

  const setLongPressForceActive = (active: boolean) => {
    setForceState(prev => ({ ...prev, isLongPressForceActive: active }));
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        forceState, 
        birthdayState,
        incrementStopCount, 
        incrementResetCount, 
        incrementLapCount, 
        consumeForcePair,
        resetForceState,
        setLongPressForceActive,
        updateBirthdayData,
        setBirthdayRevealed,
        resetBirthdayData,
        incrementBirthdayStop
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
