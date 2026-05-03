import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function TimerView() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // in seconds

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return;
    
    setRemainingTime(totalSeconds);
    setIsActive(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const cancelTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setRemainingTime(0);
  };

  useEffect(() => {
    if (isActive && !isPaused && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    if (remainingTime === 0 && isActive) {
      setIsActive(false);
      // Timer finished logic can go here (sound, etc)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, remainingTime]);

  const formatRemaining = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return {
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0')
    };
  };

  if (isActive) {
    const { h, m, s } = formatRemaining(remainingTime);
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-8">
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          {/* Progress Circle (Simplified) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="120" fill="none" stroke="#262626" strokeWidth="4" />
            <motion.circle 
              cx="128" cy="128" r="120" 
              fill="none" 
              stroke="#fb923c" 
              strokeWidth="4" 
              strokeDasharray="754"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 754 * (1 - remainingTime / (hours * 3600 + minutes * 60 + seconds)) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="text-6xl font-light tabular-nums leading-none">
            {h !== '00' && <span>{h}:</span>}
            <span>{m}</span>
            <span className="text-zinc-600">:</span>
            <span>{s}</span>
          </div>
        </div>

        <div className="flex w-full justify-between gap-8 max-w-sm">
          <button 
            onClick={cancelTimer}
            className="w-20 h-20 rounded-full bg-zinc-800 text-white flex items-center justify-center text-sm font-medium"
          >
            Annulla
          </button>
          <button 
            onClick={togglePause}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-medium ${
              isPaused ? 'bg-indigo-900 text-indigo-400' : 'bg-orange-950 text-orange-500'
            }`}
          >
            {isPaused ? 'Riprendi' : 'Pausa'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black text-white flex flex-col p-6 overflow-hidden">
      <h1 className="text-3xl font-bold mb-8">Timer</h1>
      
      <div className="flex-1 flex items-center justify-center gap-4 mb-8">
        <div className="flex flex-col items-center">
          <input 
            type="number" value={hours} onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 bg-transparent text-4xl text-center focus:outline-none"
          />
          <span className="text-xs text-zinc-500 uppercase">ore</span>
        </div>
        <div className="flex flex-col items-center">
          <input 
            type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-16 bg-transparent text-4xl text-center focus:outline-none"
          />
          <span className="text-xs text-zinc-500 uppercase">min</span>
        </div>
        <div className="flex flex-col items-center">
          <input 
            type="number" value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-16 bg-transparent text-4xl text-center focus:outline-none"
          />
          <span className="text-xs text-zinc-500 uppercase">sec</span>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-xs mx-auto mb-12">
        <button className="w-20 h-20 rounded-full bg-zinc-900 text-zinc-600 cursor-not-allowed text-sm font-medium">Annulla</button>
        <button 
          onClick={startTimer}
          className="w-20 h-20 rounded-full bg-indigo-900 text-indigo-300 text-sm font-medium"
        >
          Avvia
        </button>
      </div>
    </div>
  );
}
