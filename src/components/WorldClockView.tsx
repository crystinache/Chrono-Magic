import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

export default function WorldClockView() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, offset: number = 0) => {
    const d = new Date(date.getTime() + (offset * 3600000));
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getAmPm = (date: Date, offset: number = 0) => {
    return ''; // Apple format usually 24h in IT locale
  };

  return (
    <div className="flex-1 bg-black text-white p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orologio mondiale</h1>
        <button className="text-orange-500">
          <Plus size={28} />
        </button>
      </div>

      <div className="divide-y divide-zinc-800">
        <div className="py-4 flex justify-between items-center">
          <div>
            <div className="text-zinc-500 text-sm">Oggi, +0 ORE</div>
            <div className="text-2xl font-medium">Roma</div>
          </div>
          <div className="text-5xl font-light tabular-nums">
            {formatTime(time, 0)}
          </div>
        </div>

        <div className="py-4 flex justify-between items-center">
          <div>
            <div className="text-zinc-500 text-sm">Oggi, +1 ORA</div>
            <div className="text-2xl font-medium">Bucarest</div>
          </div>
          <div className="text-5xl font-light tabular-nums text-zinc-400">
            {formatTime(time, 1)}
          </div>
        </div>
      </div>
    </div>
  );
}
