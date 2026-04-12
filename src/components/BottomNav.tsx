import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface BottomNavProps {
  onSecretMenuOpen: () => void;
}

export default function BottomNav({ onSecretMenuOpen }: BottomNavProps) {
  const [activeTab, setActiveTab] = useState('Cronometro');
  const lastTapRef = useRef<number>(0);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'Cronometro') {
      const now = Date.now();
      const delay = now - lastTapRef.current;
      if (delay < 300) {
        onSecretMenuOpen();
      }
      lastTapRef.current = now;
    }
  };

  const tabs = ['Allarme', 'Orologio mondiale', 'Cronometro', 'Timer'];

  return (
    <div className="flex justify-around items-center w-full px-4 py-6 bg-black border-t border-zinc-800 select-none">
      {tabs.map((tab) => (
        <motion.button
          key={tab}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTabClick(tab)}
          className={`text-sm font-medium transition-colors ${
            activeTab === tab ? 'text-indigo-400' : 'text-zinc-500'
          }`}
        >
          {tab}
        </motion.button>
      ))}
    </div>
  );
}
