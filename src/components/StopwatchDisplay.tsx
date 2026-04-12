import React from 'react';

interface StopwatchDisplayProps {
  minutes: string;
  seconds: string;
  milliseconds: string;
  onDoubleTapMinutes?: () => void;
  onDoubleTapSeconds?: () => void;
  onDoubleTapMilliseconds?: () => void;
}

export default function StopwatchDisplay({ 
  minutes, 
  seconds, 
  milliseconds,
  onDoubleTapMinutes,
  onDoubleTapSeconds,
  onDoubleTapMilliseconds
}: StopwatchDisplayProps) {
  const handleDoubleTap = (callback?: () => void) => (e: React.MouseEvent | React.TouchEvent) => {
    if (e.detail === 2) {
      callback?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none">
      <div className="text-[3.5rem] md:text-[5rem] font-light text-white tracking-tight leading-none flex items-baseline tabular-nums">
        <span onClick={handleDoubleTap(onDoubleTapMinutes)}>{minutes}</span>
        <span className="mx-2 opacity-80">:</span>
        <span onClick={handleDoubleTap(onDoubleTapSeconds)}>{seconds}</span>
        <span className="mx-2 opacity-80">.</span>
        <span onClick={handleDoubleTap(onDoubleTapMilliseconds)}>{milliseconds}</span>
      </div>
    </div>
  );
}
