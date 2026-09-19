import React from 'react';
import { Maximize2, Minimize2, Eye, EyeOff, Image, LayoutGrid } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface TopNavProps {
  onOpenBgPicker: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetLayout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenBgPicker,
  isZenMode,
  onToggleZenMode,
  isFullscreen,
  onToggleFullscreen,
  onResetLayout,
}) => {
  if (isZenMode) {
    return (
      <div className="fixed top-3 left-4 z-50">
        <button
          onClick={() => {
            audioManager.playSoftClick();
            onToggleZenMode();
          }}
          className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] text-amber-200 hover:text-white border border-white/10 hover:border-white/25 transition-all shadow-lg hover:scale-105"
          title="Odak modundan çık (Z)"
        >
          <Eye className="w-3 h-3" />
          <span>Odak Modundan Çık</span>
        </button>
      </div>
    );
  }

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 mx-auto max-w-xl z-30 px-3 pointer-events-none">
      <div className="glass-panel rounded-full px-4 py-2 flex items-center justify-between border border-white/10 shadow-2xl pointer-events-auto">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-stone-900 font-bold text-[11px] shadow-sm">
            ☕
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-white">Read With Me</span>
            <span className="text-[9px] text-amber-400/80 font-mono hidden sm:inline">lo-fi space</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Background selector button */}
          <button
            onClick={() => {
              audioManager.playSoftClick();
              onOpenBgPicker();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-button text-[11px] text-zinc-300 hover:text-white"
            title="Arka Planı Değiştir"
          >
            <Image className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Arka Plan</span>
          </button>

          {/* Zen Mode toggle */}
          <button
            onClick={() => {
              audioManager.playSoftClick();
              onToggleZenMode();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-button text-[11px] text-zinc-300 hover:text-white"
            title="Sadece timer kalsın, diğer her şeyi gizle (Z)"
          >
            <EyeOff className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Odak Modu</span>
          </button>

          {/* Reset Layout button */}
          {onResetLayout && (
            <button
              onClick={() => {
                audioManager.playSoftClick();
                onResetLayout();
              }}
              className="p-1.5 rounded-full glass-button text-zinc-300 hover:text-amber-300 transition-colors"
              title="Pencere Düzenini Sıfırla"
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={() => {
              audioManager.playSoftClick();
              onToggleFullscreen();
            }}
            className="p-1.5 rounded-full glass-button text-zinc-300 hover:text-white"
            title={isFullscreen ? "Tam Ekrandan Çık (F)" : "Tam Ekran Yap (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </header>
  );
};
