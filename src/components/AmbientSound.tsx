import React, { useState } from 'react';
import { CloudRain, Flame, Wind, Volume2, ChevronUp, ChevronDown } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface AmbientSoundProps {
  isZenMode: boolean;
}

export const AmbientSound: React.FC<AmbientSoundProps> = ({ isZenMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const [rainVol, setRainVol] = useState(0.5);

  const [fireActive, setFireActive] = useState(false);
  const [fireVol, setFireVol] = useState(0.5);

  const [windActive, setWindActive] = useState(false);
  const [windVol, setWindVol] = useState(0.4);

  if (isZenMode) return null;

  const toggleRain = () => {
    const next = !rainActive;
    setRainActive(next);
    audioManager.toggleAmbient('rain', next, rainVol);
  };

  const changeRainVol = (vol: number) => {
    setRainVol(vol);
    if (rainActive) audioManager.setAmbientVolume('rain', vol);
  };

  const toggleFire = () => {
    const next = !fireActive;
    setFireActive(next);
    audioManager.toggleAmbient('fire', next, fireVol);
  };

  const changeFireVol = (vol: number) => {
    setFireVol(vol);
    if (fireActive) audioManager.setAmbientVolume('fire', vol);
  };

  const toggleWind = () => {
    const next = !windActive;
    setWindActive(next);
    audioManager.toggleAmbient('wind', next, windVol);
  };

  const changeWindVol = (vol: number) => {
    setWindVol(vol);
    if (windActive) audioManager.setAmbientVolume('wind', vol);
  };

  const anyActive = rainActive || fireActive || windActive;

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 w-64 md:w-72">
        {/* Header Bar */}
        <div
          onClick={() => {
            audioManager.playSoftClick();
            setIsOpen(!isOpen);
          }}
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
              anyActive
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-zinc-400'
            }`}>
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                Ortam Sesleri
                {anyActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                {anyActive ? 'Aktif Lo-Fi Ambiyansı' : 'Kapalı (Tıklayıp açın)'}
              </div>
            </div>
          </div>

          <button
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label={isOpen ? "Paneli Kapat" : "Paneli Aç"}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Sliders and Toggles */}
        {isOpen && (
          <div className="p-3 pt-1.5 border-t border-white/5 space-y-2.5 animate-fade-in text-xs">
            {/* Rain */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleRain}
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors text-[11px] ${
                    rainActive ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Pencere Yağmuru</span>
                </button>
                <span className="font-mono text-[9px] text-zinc-500">
                  {rainActive ? `%${Math.round(rainVol * 100)}` : 'Kapalı'}
                </span>
              </div>
              {rainActive && (
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={rainVol}
                  onChange={(e) => changeRainVol(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              )}
            </div>

            {/* Fireplace */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleFire}
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors text-[11px] ${
                    fireActive ? 'bg-orange-500/20 text-orange-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Şömine Çatırtısı</span>
                </button>
                <span className="font-mono text-[9px] text-zinc-500">
                  {fireActive ? `%${Math.round(fireVol * 100)}` : 'Kapalı'}
                </span>
              </div>
              {fireActive && (
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={fireVol}
                  onChange={(e) => changeFireVol(parseFloat(e.target.value))}
                  className="w-full accent-orange-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              )}
            </div>

            {/* Gentle Wind */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleWind}
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors text-[11px] ${
                    windActive ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>Gece Esintisi</span>
                </button>
                <span className="font-mono text-[9px] text-zinc-500">
                  {windActive ? `%${Math.round(windVol * 100)}` : 'Kapalı'}
                </span>
              </div>
              {windActive && (
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={windVol}
                  onChange={(e) => changeWindVol(parseFloat(e.target.value))}
                  className="w-full accent-teal-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              )}
            </div>
          </div>
        )}
      </div>
  );
};
