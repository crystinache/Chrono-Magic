import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Settings, Skull, Heart, Info, Gift, Palette, Plus, Trash2, ChevronRight, Edit2, Check, RefreshCw, Type, Keyboard } from 'lucide-react';
import { useSettings, ForceAfterUnit, ForceOn, ForceType, Preset } from '../context/SettingsContext';

interface SecretMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecretMenu({ isOpen, onClose }: SecretMenuProps) {
  const { 
    settings, 
    updateSettings, 
    resetBirthdayData, 
    presets, 
    saveCurrentAsPreset, 
    loadPreset, 
    deletePreset,
    updatePreset
  } = useSettings();
  const [view, setView] = useState<'main' | 'presets'>('main');
  const [cryptextValue, setCryptextValue] = useState('');

  const copyToForce = () => {
    const numbers = getNumbersTransformation(cryptextValue);
    if (numbers) {
      setInputValue(numbers);
      updateSettings({ forceValue: numbers });
    }
  };

  const letterToNumber: Record<string, string> = {
    a: '0', b: '9', c: '0', d: '10', e: '3', f: '1', g: '6', h: '4', i: '1', j: '1',
    k: '71', l: '7', m: '41', n: '4', o: '0', p: '01', q: '6', r: '21', s: '5',
    t: '7', u: '0', v: '1', w: '14', x: '7', y: '6', z: '2'
  };

  const uppercaseTransformLetters = ['e', 'f', 'l', 'm', 'r', 's', 'v', 'z'];

  const getTransformedCryptext = (text: string) => {
    return text.split('').map(char => {
      const lower = char.toLowerCase();
      if (uppercaseTransformLetters.includes(lower)) {
        return char.toUpperCase();
      }
      return char;
    }).join('');
  };

  const getNumbersTransformation = (text: string) => {
    const chars = text.toLowerCase().split('');
    const numbers = chars.map(char => letterToNumber[char] || '');
    return [...numbers].reverse().join('');
  };

  const [isNamingPreset, setIsNamingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSettings, setEditingSettings] = useState<any>(null); // To store settings being edited
  const [inputValue, setInputValue] = useState(settings.forceValue);
  const [forceAfterInput, setForceAfterInput] = useState(settings.forceAfterValue.toString());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleEnterValue = () => {
    updateSettings({ forceValue: inputValue, isActive: true });
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return '';
    let formatted = val;
    if (val.length % 2 !== 0) {
      formatted = '0' + val;
    }
    return formatted.match(/.{1,2}/g)?.join(' ') || formatted;
  };

  const speedOptions = [
    { label: '0.85 MS', value: 0.85 },
    { label: '0.90 MS', value: 0.90 },
    { label: '0.95 MS', value: 0.95 },
    { label: '1 SEC', value: 1.00 },
    { label: '1.05 SEC', value: 1.05 },
    { label: '1.10 SEC', value: 1.10 },
    { label: '1.15 SEC', value: 1.15 },
  ];

  const tooltips: Record<string, string> = {
    reset: "Ricomincia le forzature dall'inizio tenendo premuto Reset per 1 secondo.",
    longPress: "Ignora 'Force After' e attiva la forzatura tenendo premuto Start per 1 secondo.",
    statusBar: "Nasconde l'orologio e le icone di sistema nella schermata principale.",
    speed: "Cambia la velocità reale del tempo mantenendo la grafica fluida."
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-[#1a1b1e] text-zinc-300 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 gap-2">
            <button 
              onClick={onClose} 
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-full transition-all active:scale-95 whitespace-nowrap uppercase tracking-wider"
            >
              PERFORM
            </button>
            <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
              <button 
                onClick={() => setView('main')}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                  view === 'main' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                MAIN
              </button>
              <button 
                onClick={() => setView('presets')}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                  view === 'presets' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                PRESETS
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-8 relative"
            onClick={() => setActiveTooltip(null)}
          >
            {view === 'presets' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">Saved Presets</h2>
                  {!isNamingPreset ? (
                    <button 
                      onClick={() => setIsNamingPreset(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      ADD PRESET
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                       <input 
                        autoFocus
                        placeholder="Preset Name..."
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newPresetName.trim()) {
                            saveCurrentAsPreset(newPresetName);
                            setNewPresetName('');
                            setIsNamingPreset(false);
                          }
                        }}
                        className="bg-zinc-800 border border-indigo-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none w-32"
                      />
                      <button 
                        onClick={() => {
                          if (newPresetName.trim()) {
                            saveCurrentAsPreset(newPresetName);
                            setNewPresetName('');
                            setIsNamingPreset(false);
                          }
                        }}
                        className="bg-indigo-600 text-white p-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setIsNamingPreset(false);
                          setNewPresetName('');
                        }}
                        className="bg-zinc-800 text-zinc-500 p-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {presets.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <p className="text-zinc-500">No presets saved yet.</p>
                    <p className="text-xs text-zinc-600 uppercase tracking-widest">Click add to save current settings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {presets.map((preset, index) => (
                      <div 
                        key={preset.id}
                        onClick={() => {
                          loadPreset(preset.id);
                          onClose();
                        }}
                        className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="space-y-2 relative z-10">
                          {/* Row 1: Index + Name */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              {editingPresetId === preset.id ? (
                                <input 
                                  autoFocus
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-zinc-800 border-b border-indigo-500 text-white font-bold px-1 focus:outline-none w-32"
                                />
                              ) : (
                                <>
                                  <span className="text-indigo-500">{index + 1}.</span>
                                  {preset.name}
                                </>
                              )}
                            </h3>
                            <div className="flex items-center gap-1">
                              {editingPresetId === preset.id ? (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updatePreset(preset.id, editingName, editingSettings);
                                      setEditingPresetId(null);
                                      setEditingSettings(null);
                                    }}
                                    className="bg-indigo-600 text-white px-3 py-1 rounded-md active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest"
                                  >
                                    SALVA
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPresetId(null);
                                      setEditingSettings(null);
                                    }}
                                    className="bg-zinc-700 text-zinc-400 p-1.5 rounded-md active:scale-95 transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPresetId(preset.id);
                                      setEditingName(preset.name);
                                      setEditingSettings(preset.settings);
                                    }}
                                    className="text-zinc-600 hover:text-indigo-400 transition-colors p-1"
                                    title="Edit preset"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete preset?')) deletePreset(preset.id);
                                    }}
                                    className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                    title="Delete preset"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {editingPresetId === preset.id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSettings({ ...settings });
                              }}
                              className={`flex items-center gap-2 w-full justify-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all mt-2 ${
                                JSON.stringify(editingSettings) === JSON.stringify(settings)
                                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50'
                                  : 'bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:bg-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              <RefreshCw size={12} className={JSON.stringify(editingSettings) === JSON.stringify(settings) ? "" : "animate-spin-slow"} />
                              {JSON.stringify(editingSettings) === JSON.stringify(settings) 
                                ? 'IMPOSTAZIONI AGGIORNATE' 
                                : 'AGGIORNA IMPOSTAZIONI ATTUALI'}
                            </button>
                          )}

                          {/* Row 2: Force Value + Mode */}
                          <div className="flex items-center gap-2">
                            <div className="bg-white text-black px-2 py-0.5 rounded text-xs font-black">
                              {formatDisplayValue(preset.settings.forceValue) || "EMPTY"}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                              {preset.settings.forceType === 'ms' ? 'MS' : 
                               preset.settings.forceType === 'sec+ms' ? 'SEC + MS' : 'SEC:MS'}
                            </span>
                          </div>

                          {/* Row 3: Force Method Logic */}
                          <div className="text-xs text-zinc-400 font-medium">
                            Force after {preset.settings.forceAfterValue} {preset.settings.forceAfterUnit}, 
                            on {preset.settings.forceOn}
                          </div>

                          {/* Row 4: Chrono Speed */}
                          <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                            <Palette size={10} className="text-indigo-500" />
                            CHRONO SPEED: {speedOptions.find(o => o.value === preset.settings.chronoSpeed)?.label || preset.settings.chronoSpeed}
                          </div>

                          {/* Row 5: Active General Settings Toggles */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {preset.settings.resetForceOnLongPress && (
                              <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded-md border border-zinc-700">LONG PRESS RESET</span>
                            )}
                            {preset.settings.longPressStartToForce && (
                              <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded-md border border-zinc-700">LONG PRESS START</span>
                            )}
                            {preset.settings.hideStatusBar && (
                              <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded-md border border-zinc-700">HIDE STATUS BAR</span>
                            )}
                          </div>

                          {/* Row 6/7: Toxic / Birthday */}
                          {(preset.settings.toxicForceActive || preset.settings.birthdayRevealActive) && (
                            <div className="flex flex-wrap gap-1.5">
                              {preset.settings.toxicForceActive && (
                                <span className="bg-red-500/10 text-red-500 text-[9px] px-1.5 py-0.5 rounded-md border border-red-500/20 font-bold uppercase">TOXIC: {preset.settings.toxicValue}</span>
                              )}
                              {preset.settings.birthdayRevealActive && (
                                <div className="flex gap-1.5">
                                  <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded-md border border-purple-500/20 font-bold uppercase">BIRTHDAY REVEAL</span>
                                  {preset.settings.zodiacRevealActive && (
                                    <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded-md border border-purple-500/20 font-bold uppercase">ZODIAC</span>
                                  )}
                                  {preset.settings.famousPersonRevealActive && (
                                    <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded-md border border-purple-500/20 font-bold uppercase">FAMOUS</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="text-indigo-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Cryptext Section */}
                <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-medium">
                      <Type size={20} />
                      <span className="text-lg">Cryptext Tool</span>
                    </div>
                    {cryptextValue && (
                      <button 
                        onClick={() => setCryptextValue('')}
                        className="text-[10px] text-zinc-500 hover:text-white transition-colors underline underline-offset-4 uppercase tracking-widest"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-indigo-500 transition-colors">
                        <Keyboard size={16} />
                      </div>
                      <input 
                        type="text"
                        placeholder="Write something..."
                        value={cryptextValue}
                        onChange={(e) => setCryptextValue(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      {/* Cryptext Font Preview */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600">
                          <Type size={16} />
                        </div>
                        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 min-h-[46px] flex items-center overflow-hidden">
                          <div className="text-2xl text-white font-cryptext truncate leading-none">
                            {getTransformedCryptext(cryptextValue) || <span className="text-zinc-700 font-sans italic text-sm">Cryptext Font</span>}
                          </div>
                        </div>
                      </div>

                      {/* Numbers Preview */}
                      <div className="space-y-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                            <span className="font-bold text-[10px] tracking-tight">NUM</span>
                          </div>
                          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-4 py-3 min-h-[46px] flex items-center overflow-hidden">
                            <div className="text-lg text-indigo-500 font-mono font-bold tracking-widest truncate leading-none">
                              {getNumbersTransformation(cryptextValue) || <span className="text-zinc-700 font-sans italic text-sm">Number Transformation</span>}
                            </div>
                          </div>
                        </div>
                        {cryptextValue && (
                          <button 
                            onClick={copyToForce}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                          >
                            <Check size={14} />
                            Copy to Force
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Force Method */}
            <div 
              className="space-y-6 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-[#d4af37] font-medium">
                <Heart size={20} fill="currentColor" />
                <span className="text-lg">Force Method</span>
              </div>

              {/* Force After */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Force After :</span>
                <input
                  type="number"
                  min="0"
                  value={forceAfterInput}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setForceAfterInput(val.toString());
                    updateSettings({ forceAfterValue: val });
                  }}
                  className="w-20 bg-transparent border border-zinc-700 rounded-md px-2 py-1 text-center focus:outline-none focus:border-[#d4af37]"
                />
                <select
                  value={settings.forceAfterUnit}
                  onChange={(e) => updateSettings({ forceAfterUnit: e.target.value as ForceAfterUnit })}
                  className="bg-transparent border border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#d4af37] text-white"
                >
                  <option value="seconds" className="text-black">seconds</option>
                  <option value="stops" className="text-black">stops</option>
                  <option value="resets" className="text-black">resets</option>
                  <option value="laps" className="text-black">laps</option>
                </select>
              </div>

              {/* Force On */}
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium">Force on :</span>
                <div className="flex items-center gap-4">
                  {(['Stop', 'Lap', 'Either'] as ForceOn[]).map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        settings.forceOn === option ? 'border-[#d4af37]' : 'border-zinc-600 group-hover:border-zinc-500'
                      }`}>
                        {settings.forceOn === option && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="forceOn"
                        value={option}
                        checked={settings.forceOn === option}
                        onChange={() => updateSettings({ forceOn: option })}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Force Value Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={settings.toxicForceActive ? "TOXIC VALUE" : "Value"}
                  disabled={settings.toxicForceActive}
                  maxLength={20}
                  value={settings.toxicForceActive ? "" : inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                  className={`flex-1 bg-transparent border rounded-md px-4 py-2 focus:outline-none transition-colors ${
                    settings.toxicForceActive 
                      ? 'border-red-600/50 placeholder:text-red-600 font-bold' 
                      : 'border-zinc-700 focus:border-[#d4af37] placeholder:text-zinc-600'
                  }`}
                />
                <button
                  onClick={handleEnterValue}
                  disabled={settings.toxicForceActive}
                  className={`px-6 py-2 font-bold rounded-md transition-colors ${
                    settings.toxicForceActive
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  ENTER
                </button>
              </div>

              {/* Display Fixed Value */}
              {settings.forceValue && (
                <div className="flex">
                  <div className="bg-white text-black font-bold px-4 py-2 rounded-md min-w-[60px] text-center text-xl">
                    {formatDisplayValue(settings.forceValue)}
                  </div>
                </div>
              )}

              {/* Force Type Buttons */}
              <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                <button
                  onClick={() => updateSettings({ forceType: 'ms' })}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${
                    settings.forceType === 'ms' ? 'bg-[#4a628a] text-white' : 'bg-zinc-800/50 text-zinc-500'
                  }`}
                >
                  ms
                </button>
                <button
                  onClick={() => updateSettings({ forceType: 'sec+ms' })}
                  className={`flex-1 py-3 text-sm font-bold transition-colors border-x border-zinc-800 ${
                    settings.forceType === 'sec+ms' ? 'bg-[#2d5a4c] text-white' : 'bg-zinc-800/50 text-zinc-500'
                  }`}
                >
                  sec + ms
                </button>
                <button
                  onClick={() => updateSettings({ forceType: 'sec:ms' })}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${
                    settings.forceType === 'sec:ms' ? 'bg-[#a67c52] text-white' : 'bg-zinc-800/50 text-zinc-500'
                  }`}
                >
                  sec : ms
                </button>
              </div>
            </div>

            {/* Section: General Settings */}
            <div 
              className="space-y-6 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-zinc-400 font-medium">
                <Settings size={20} />
                <span className="text-lg">General Settings</span>
              </div>
              
              <div className="space-y-6">
                {/* Reset Force Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm">Reset Force Value</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === 'reset' ? null : 'reset');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Info size={14} />
                      </button>
                      
                      <AnimatePresence>
                        {activeTooltip === 'reset' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 top-6 z-30 w-64 bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-2xl"
                          >
                            <button 
                              onClick={() => setActiveTooltip(null)}
                              className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300"
                            >
                              <X size={12} />
                            </button>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-5">{tooltips.reset}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => updateSettings({ resetForceOnLongPress: !settings.resetForceOnLongPress })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.resetForceOnLongPress ? 'bg-[#d4af37]' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        settings.resetForceOnLongPress ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Long Press Start to Force */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm">Long Press Start to Force</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === 'longPress' ? null : 'longPress');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Info size={14} />
                      </button>

                      <AnimatePresence>
                        {activeTooltip === 'longPress' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 top-6 z-30 w-64 bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-2xl"
                          >
                            <button 
                              onClick={() => setActiveTooltip(null)}
                              className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300"
                            >
                              <X size={12} />
                            </button>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-5">{tooltips.longPress}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => updateSettings({ longPressStartToForce: !settings.longPressStartToForce })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.longPressStartToForce ? 'bg-[#d4af37]' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        settings.longPressStartToForce ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Hide Status Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm">Hide Status Bar</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === 'statusBar' ? null : 'statusBar');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Info size={14} />
                      </button>

                      <AnimatePresence>
                        {activeTooltip === 'statusBar' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 top-6 z-30 w-64 bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-2xl"
                          >
                            <button 
                              onClick={() => setActiveTooltip(null)}
                              className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300"
                            >
                              <X size={12} />
                            </button>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-5">{tooltips.statusBar}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => updateSettings({ hideStatusBar: !settings.hideStatusBar })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.hideStatusBar ? 'bg-[#d4af37]' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        settings.hideStatusBar ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Chrono Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm font-medium">Chrono speed :</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === 'speed' ? null : 'speed');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Info size={14} />
                      </button>

                      <AnimatePresence>
                        {activeTooltip === 'speed' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 top-6 z-30 w-64 bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-2xl"
                          >
                            <button 
                              onClick={() => setActiveTooltip(null)}
                              className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300"
                            >
                              <X size={12} />
                            </button>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-5">{tooltips.speed}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="relative w-20">
                      <select
                        value={settings.chronoSpeed}
                        onChange={(e) => updateSettings({ chronoSpeed: parseFloat(e.target.value) })}
                        className="w-full bg-[#d4af37] text-black font-bold py-1 pl-1 pr-4 rounded-md appearance-none focus:outline-none cursor-pointer text-center text-sm"
                      >
                        {speedOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white text-black">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Toxic Force */}
            <div className="space-y-6 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500 font-medium">
                  <Skull size={20} />
                  <span className="text-lg">Toxic Force</span>
                </div>
                <button
                  onClick={() => {
                    const nextActive = !settings.toxicForceActive;
                    if (nextActive) {
                      updateSettings({ 
                        toxicForceActive: nextActive,
                        forceValue: '' // Clear standard force value to avoid confusion
                      });
                      setInputValue(''); // Also clear the local input state in the menu
                    } else {
                      updateSettings({ toxicForceActive: nextActive });
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.toxicForceActive ? 'bg-red-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.toxicForceActive ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold uppercase">Value</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={settings.toxicValue || ''}
                      onChange={(e) => updateSettings({ toxicValue: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-transparent border border-zinc-700 rounded-md pl-16 pr-4 py-2 focus:outline-none focus:border-red-600 text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const total = settings.toxicValue;
                      if (total <= 0) return;
                      
                      const minPairs = Math.ceil(total / 99);
                      const count = minPairs + Math.floor(Math.random() * 2) + 2; // +2 or +3
                      
                      let target = total;
                      let pairs: number[] = [];
                      
                      for (let i = 0; i < count - 1; i++) {
                        const remaining = count - 1 - i;
                        const minVal = Math.max(0, target - remaining * 99);
                        const maxVal = Math.min(99, target);
                        const val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
                        pairs.push(val);
                        target -= val;
                      }
                      pairs.push(target);
                      
                      const formattedPairs = pairs
                        .sort(() => Math.random() - 0.5)
                        .map(n => n.toString().padStart(2, '0'));
                        
                      updateSettings({ toxicPairs: formattedPairs, isActive: true });
                    }}
                    className="px-6 py-2 bg-zinc-700 text-white font-bold rounded-md hover:bg-zinc-600 transition-colors"
                  >
                    ENTER
                  </button>
                </div>

                {settings.toxicPairs.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center text-sm font-mono bg-white p-3 rounded-lg border border-zinc-200">
                    {settings.toxicPairs.map((pair, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-red-600 font-bold">{pair}</span>
                        {idx < settings.toxicPairs.length - 1 && <span className="text-zinc-400">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Birthday Reveal */}
            <div className="space-y-6 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-500 font-medium">
                  <Gift size={20} />
                  <span className="text-lg">Birthday Reveal</span>
                </div>
                <button
                  onClick={() => {
                    const nextActive = !settings.birthdayRevealActive;
                    updateSettings({ birthdayRevealActive: nextActive });
                    if (!nextActive) {
                      resetBirthdayData();
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.birthdayRevealActive ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.birthdayRevealActive ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {settings.birthdayRevealActive && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                      <span className="text-sm text-zinc-300">Zodiac Sign</span>
                      <button
                        onClick={() => updateSettings({ zodiacRevealActive: !settings.zodiacRevealActive })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          settings.zodiacRevealActive ? 'bg-purple-500' : 'bg-zinc-600'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          settings.zodiacRevealActive ? 'left-5.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                      <span className="text-sm text-zinc-300">Famous Person</span>
                      <button
                        onClick={() => updateSettings({ famousPersonRevealActive: !settings.famousPersonRevealActive })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          settings.famousPersonRevealActive ? 'bg-purple-500' : 'bg-zinc-600'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          settings.famousPersonRevealActive ? 'left-5.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Palette size={16} />
                      <span>Font Color Reveal</span>
                    </div>
                    <div className="px-2">
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-white via-zinc-500 to-black relative">
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={(() => {
                            const hex = settings.revealFontColor.replace('#', '');
                            return 255 - parseInt(hex.substring(0, 2), 16);
                          })()}
                          onChange={(e) => {
                            const val = 255 - parseInt(e.target.value);
                            const hex = val.toString(16).padStart(2, '0');
                            const color = `#${hex}${hex}${hex}`;
                            updateSettings({ revealFontColor: color });
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 transition-all pointer-events-none"
                          style={{ 
                            left: `calc(${(() => {
                              const hex = settings.revealFontColor.replace('#', '');
                              const val = 255 - parseInt(hex.substring(0, 2), 16);
                              return (val / 255) * 100;
                            })()}% - 8px)` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-bold uppercase">
                        <span>White</span>
                        <span>Gray</span>
                        <span>Black</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Preview</span>
                    <div className="bg-black p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center min-h-[80px] text-center">
                      <p className="text-sm font-bold" style={{ color: settings.revealFontColor }}>
                        03 12
                      </p>
                      {settings.zodiacRevealActive && (
                        <p className="text-xs mt-1" style={{ color: settings.revealFontColor }}>
                          Sagittarius
                        </p>
                      )}
                      {settings.famousPersonRevealActive && (
                        <p className="text-xs mt-1 italic" style={{ color: settings.revealFontColor }}>
                          Famous Person Name
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
          <div className="p-6 text-center text-xs text-zinc-600 uppercase tracking-widest">
            Chrono Magic v1.0.0
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
