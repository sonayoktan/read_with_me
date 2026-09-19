import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Music, Sparkles } from 'lucide-react';
import { Timer } from './components/Timer';
import { SpotifyPlayer } from './components/SpotifyPlayer';
import { BackgroundPicker } from './components/BackgroundPicker';
import { AmbientSound } from './components/AmbientSound';
import { ReadingCard } from './components/ReadingCard';
import { TopNav } from './components/TopNav';
import { DraggableCard } from './components/DraggableCard';
import { DustParticles } from './components/DustParticles';
import cozyIllustration from './assets/illustration.jpg';

export const App: React.FC = () => {
  // Live timer progress (0.0 at 25:00 -> 1.0 at 00:00) for sunset to twilight shift
  const [timerProgress, setTimerProgress] = useState<number>(0);

  // Persistence via localStorage
  const [bgUrl, setBgUrl] = useState<string>(() => {
    const saved = localStorage.getItem('rwm_bg_url');
    // If not set or was the old unsplash default, use the local illustration
    if (!saved || saved.includes('photo-1518495973542-4542c06a5843')) {
      return cozyIllustration;
    }
    return saved;
  });

  const [overlayOpacity, setOverlayOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('rwm_overlay_opacity');
    // Default to a gentle 0.20 loşluk so image is vibrant and not suffocated
    return saved !== null ? parseFloat(saved) : 0.20;
  });

  const [warmFilter, setWarmFilter] = useState<boolean>(() => {
    const saved = localStorage.getItem('rwm_warm_filter');
    return saved !== null ? saved === 'true' : true;
  });

  const [vignette, setVignette] = useState<boolean>(() => {
    const saved = localStorage.getItem('rwm_vignette');
    return saved !== null ? saved === 'true' : true;
  });

  const [retroScanlines, setRetroScanlines] = useState<boolean>(() => {
    return localStorage.getItem('rwm_retro_scanlines') === 'true';
  });

  // Dynamic Z-Index for draggable focus management
  const [zIndices, setZIndices] = useState<Record<string, number>>({
    timer: 35,
    reading: 34,
    spotify: 32,
    ambient: 32,
  });

  const bringToFront = (id: string) => {
    setZIndices((prev) => {
      const maxZ = Math.max(...Object.values(prev), 30);
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  const handleResetLayout = () => {
    ['timer', 'reading', 'spotify', 'ambient'].forEach((id) => {
      localStorage.removeItem(`rwm_drag_pos_${id}`);
    });
    window.location.reload();
  };

  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rwm_bg_url', bgUrl);
  }, [bgUrl]);

  useEffect(() => {
    localStorage.setItem('rwm_overlay_opacity', overlayOpacity.toString());
  }, [overlayOpacity]);

  useEffect(() => {
    localStorage.setItem('rwm_warm_filter', warmFilter.toString());
  }, [warmFilter]);

  useEffect(() => {
    localStorage.setItem('rwm_vignette', vignette.toString());
  }, [vignette]);

  useEffect(() => {
    localStorage.setItem('rwm_retro_scanlines', retroScanlines.toString());
  }, [retroScanlines]);

  // Keyboard Shortcuts (Z for Zen, F for Fullscreen, B for Background)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'z' || e.key === 'Z') {
        setIsZenMode(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBgPickerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-stone-950 font-sans">
      {/* 1. Fullscreen Cover Background Image (Task 1.2: h-screen w-screen object-cover with girl & cat centered) */}
      <img
        src={bgUrl}
        alt="Read With Me Cozy Illustration"
        className="fixed inset-0 w-screen h-screen object-cover object-[52%_50%] md:object-[51%_50%] transition-opacity duration-700 ease-in-out select-none pointer-events-none"
        style={{
          objectPosition: '52% 50%',
        }}
      />

      {/* 2. Atmospheric Overlays & Dynamic Lighting Shift */}
      {/* 2a. Gentle Vignette: softly dims the edges while keeping the girl and cat in warm focus */}
      {vignette && (
        <div
          className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            background: 'radial-gradient(ellipse at 52% 50%, rgba(20, 14, 10, 0) 35%, rgba(18, 12, 8, 0.28) 72%, rgba(10, 7, 5, 0.58) 100%)',
          }}
        />
      )}

      {/* 2b. Dynamic Sunset to Twilight Shift: transitions as 25-minute timer progresses */}
      {warmFilter && (
        <>
          {/* Phase 1: Sweet Golden Sunset & Amber glow (fades smoothly as session progresses) */}
          <div
            className="fixed inset-0 pointer-events-none z-[2] mix-blend-soft-light transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(245, 158, 11, 0.11) 45%, rgba(225, 29, 72, 0.08) 100%)',
              opacity: Math.max(0, 1 - timerProgress * 0.8),
            }}
          />

          {/* Phase 2: Cozy Evening Twilight & Blue-Hour loşluğu (emerges gently towards end of session) */}
          <div
            className="fixed inset-0 pointer-events-none z-[2] mix-blend-soft-light transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.10) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(30, 27, 75, 0.25) 100%)',
              opacity: timerProgress * 0.9,
            }}
          />
        </>
      )}

      {/* 2c. Base loşluk (deepens gently into evening darkness as timer progresses) */}
      <div
        className="fixed inset-0 pointer-events-none z-[3] transition-all duration-1000"
        style={{
          backgroundColor: '#100c08',
          opacity: Math.min(0.6, overlayOpacity + timerProgress * 0.08),
        }}
      />

      {/* 2d. Ambient Floating Golden Dust Particles (HTML5 Canvas) */}
      <DustParticles />

      {/* 3. Subtle Vignette & Retro CRT scanlines overlay */}
      {retroScanlines && (
        <div className="fixed inset-0 pointer-events-none z-10 opacity-35 mix-blend-overlay bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90" />
      )}

      {/* 4. Top Navigation Bar */}
      <TopNav
        onOpenBgPicker={() => setIsBgPickerOpen(true)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onResetLayout={handleResetLayout}
      />

      {/* 5. Draggable Pomodoro Timer Widget (Default: Sol Üst) */}
      <DraggableCard
        id="timer"
        title="Odak Sayacı"
        icon={<Clock className="w-3 h-3" />}
        defaultPosition={() => ({ x: 20, y: 64 })}
        zIndex={zIndices.timer}
        onFocus={() => bringToFront('timer')}
        isZenMode={isZenMode}
      >
        <Timer isZenMode={isZenMode} onProgressChange={setTimerProgress} />
      </DraggableCard>

      {/* 6. Draggable Reading Card Widget (Default: Orta) */}
      {!isZenMode && (
        <DraggableCard
          id="reading"
          title="Şu An Okuyorum & Alıntılar"
          icon={<BookOpen className="w-3 h-3" />}
          defaultPosition={() => ({
            x: Math.max(20, Math.floor((window.innerWidth - 360) / 2)),
            y: 64,
          })}
          zIndex={zIndices.reading}
          onFocus={() => bringToFront('reading')}
        >
          <ReadingCard isZenMode={isZenMode} />
        </DraggableCard>
      )}

      {/* 7. Draggable Spotify Player Widget (Default: Sol Alt) */}
      {!isZenMode && (
        <DraggableCard
          id="spotify"
          title="Spotify Müzik"
          icon={<Music className="w-3 h-3" />}
          defaultPosition={() => ({
            x: 20,
            y: Math.max(64, window.innerHeight - 230),
          })}
          zIndex={zIndices.spotify}
          onFocus={() => bringToFront('spotify')}
        >
          <SpotifyPlayer isZenMode={isZenMode} />
        </DraggableCard>
      )}

      {/* 8. Draggable Ambient Sounds Mixer Widget (Default: Sağ Alt) */}
      {!isZenMode && (
        <DraggableCard
          id="ambient"
          title="Ortam Sesleri"
          icon={<Sparkles className="w-3 h-3" />}
          defaultPosition={() => ({
            x: Math.max(20, window.innerWidth - 275),
            y: Math.max(64, window.innerHeight - 230),
          })}
          zIndex={zIndices.ambient}
          onFocus={() => bringToFront('ambient')}
        >
          <AmbientSound isZenMode={isZenMode} />
        </DraggableCard>
      )}

      {/* 9. Background Picker Modal */}
      <BackgroundPicker
        currentBgUrl={bgUrl}
        onSelectBg={(url) => setBgUrl(url)}
        overlayOpacity={overlayOpacity}
        onOverlayOpacityChange={setOverlayOpacity}
        warmFilter={warmFilter}
        onToggleWarmFilter={() => setWarmFilter(!warmFilter)}
        vignette={vignette}
        onToggleVignette={() => setVignette(!vignette)}
        retroScanlines={retroScanlines}
        onToggleRetroScanlines={() => setRetroScanlines(!retroScanlines)}
        isOpen={isBgPickerOpen}
        onClose={() => setIsBgPickerOpen(false)}
      />
    </main>
  );
};

export default App;
