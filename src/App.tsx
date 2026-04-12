import React, { useState } from 'react';
import { useStopwatch } from './hooks/useStopwatch';
import StatusBar from './components/StatusBar';
import StopwatchDisplay from './components/StopwatchDisplay';
import Controls from './components/Controls';
import BottomNav from './components/BottomNav';
import SecretMenu from './components/SecretMenu';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { famousPeople } from './data/famousPeople';

function StopwatchApp() {
  const { time, isRunning, laps, start, stop, reset, lap, formatTime } = useStopwatch();
  const { 
    settings, 
    birthdayState, 
    updateBirthdayData, 
    setBirthdayRevealed, 
    resetBirthdayData 
  } = useSettings();
  const [isSecretMenuOpen, setIsSecretMenuOpen] = useState(false);

  const { minutes, seconds, milliseconds } = formatTime(time);

  const getZodiacSign = (day: number, month: number) => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Ariete";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Toro";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemelli";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancro";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leone";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Vergine";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Bilancia";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpione";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittario";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorno";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Acquario";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pesci";
    return "";
  };

  const getFamousPerson = (day: number, month: number) => {
    return famousPeople[month]?.[day] || "Unknown";
  };

  const handleDoubleTapSeconds = () => {
    if (!settings.birthdayRevealActive || birthdayState.stopCount < 2) return;
    const { value1, value2 } = birthdayState.data;
    if (value1 === null || value2 === null) return;
    
    const day = Math.min(value1, value2);
    const month = Math.max(value1, value2);
    updateBirthdayData({ day, month });
    setBirthdayRevealed(true);
  };

  const handleDoubleTapMilliseconds = () => {
    if (!settings.birthdayRevealActive || birthdayState.stopCount < 2) return;
    const { value1, value2 } = birthdayState.data;
    if (value1 === null || value2 === null) return;
    
    const month = Math.min(value1, value2);
    const day = Math.max(value1, value2);
    updateBirthdayData({ day, month });
    setBirthdayRevealed(true);
  };

  const handleDoubleTapMinutes = () => {
    resetBirthdayData();
  };

  return (
    <div 
      className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden font-sans"
      onClick={() => {
        if (birthdayState.isRevealed) setBirthdayRevealed(false);
      }}
    >
      {/* Fake Status Bar */}
      {!settings.hideStatusBar ? <StatusBar /> : <div className="h-8 bg-black" />}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {laps.length === 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-[2]" /> {/* Top spacer */}
            <StopwatchDisplay 
              minutes={minutes} 
              seconds={seconds} 
              milliseconds={milliseconds} 
              onDoubleTapMinutes={handleDoubleTapMinutes}
              onDoubleTapSeconds={handleDoubleTapSeconds}
              onDoubleTapMilliseconds={handleDoubleTapMilliseconds}
            />
            <div className="flex-[3]" /> {/* Bottom spacer to push it above center */}
          </div>
        ) : (
          <>
            {/* Stopwatch Display at the top when laps exist */}
            <StopwatchDisplay 
              minutes={minutes} 
              seconds={seconds} 
              milliseconds={milliseconds} 
              onDoubleTapMinutes={handleDoubleTapMinutes}
              onDoubleTapSeconds={handleDoubleTapSeconds}
              onDoubleTapMilliseconds={handleDoubleTapMilliseconds}
            />

            {/* Lap List Header */}
            <div className="flex justify-center gap-24 py-2 border-b border-zinc-500 text-sm font-medium text-zinc-400">
              <span className="w-16 text-center">Giro</span>
              <span className="w-32 text-center">Tempo totale</span>
            </div>

            {/* Lap List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <AnimatePresence initial={false}>
                {laps.map((l, index) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-center gap-24 py-1.5"
                  >
                    <span className="w-16 text-center text-zinc-400 text-base tabular-nums">
                      {String(laps.length - index).padStart(2, '0')}
                    </span>
                    <span className="w-32 text-center text-white text-lg font-medium tabular-nums">
                      {formatTime(l.time).minutes}:{formatTime(l.time).seconds}.{formatTime(l.time).milliseconds}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="bg-black relative">
          <AnimatePresence>
            {birthdayState.isRevealed && birthdayState.data.day !== null && birthdayState.data.month !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-28 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-50"
                style={{ color: settings.revealFontColor }}
              >
                <div className="text-base font-medium tracking-wider">
                  {String(birthdayState.data.day).padStart(2, '0')} {String(birthdayState.data.month).padStart(2, '0')}
                </div>
                {settings.zodiacRevealActive && (
                  <div className="text-sm mt-1">
                    {getZodiacSign(birthdayState.data.day, birthdayState.data.month)}
                  </div>
                )}
                {settings.famousPersonRevealActive && (
                  <div className="text-sm mt-1 italic">
                    {getFamousPerson(birthdayState.data.day, birthdayState.data.month)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <Controls 
            isRunning={isRunning} 
            time={time}
            onStart={start} 
            onStop={stop} 
            onReset={reset} 
            onLap={lap} 
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onSecretMenuOpen={() => setIsSecretMenuOpen(true)} />

      {/* Secret Menu Overlay */}
      <SecretMenu 
        isOpen={isSecretMenuOpen} 
        onClose={() => setIsSecretMenuOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <StopwatchApp />
    </SettingsProvider>
  );
}
