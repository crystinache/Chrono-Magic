import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

export default function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex justify-between items-center px-6 py-2 text-white text-sm font-medium select-none">
      <div className="flex items-center">
        <span>{formatTime(time)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Wifi size={14} strokeWidth={2.5} />
        <Signal size={14} strokeWidth={2.5} />
        <div className="flex items-center gap-1">
          <span>72%</span>
          <Battery size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
