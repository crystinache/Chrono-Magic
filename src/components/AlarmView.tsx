import React from 'react';
import { Plus } from 'lucide-react';

export default function AlarmView() {
  const alarms = [
    { time: '06:30', days: 'Solo all\'occorrenza', active: false },
    { time: '08:30', days: 'Lun-Ven', active: true },
  ];

  return (
    <div className="flex-1 bg-black text-white p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sveglia</h1>
        <button className="text-orange-500">
          <Plus size={28} />
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="pb-4 border-b border-zinc-800">
          <h2 className="text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Sonno | Risveglio</h2>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-light">Nessuna sveglia</div>
              <div className="text-zinc-500 text-sm">DOMANI MATTINA</div>
            </div>
            <button className="bg-zinc-800 text-orange-500 px-3 py-1 rounded-full text-xs font-bold">CONFIGURA</button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold">Altre</h2>
          {alarms.map((alarm, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-0">
              <div>
                <div className={`text-4xl font-light ${alarm.active ? 'text-white' : 'text-zinc-600'}`}>
                  {alarm.time}
                </div>
                <div className="text-zinc-500 text-sm">{alarm.days}</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${alarm.active ? 'bg-green-500' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${alarm.active ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
