import React, { useState } from 'react';
import { Music, ChevronDown, ChevronUp, Link as LinkIcon, Sparkles, Check } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface PresetPlaylist {
  id: string;
  title: string;
  subtitle: string;
  embedUrl: string;
}

const PRESET_PLAYLISTS: PresetPlaylist[] = [
  {
    id: 'lofi-girl',
    title: 'Lofi Girl - Beats to Study/Relax',
    subtitle: 'Klasik yumuşak lofi ritimleri',
    embedUrl: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0',
  },
  {
    id: 'lofi-beats',
    title: 'Lofi Beats (Spotify Resmi)',
    subtitle: 'En popüler odak & çalışma ritimleri',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
  },
  {
    id: 'peaceful-piano',
    title: 'Peaceful Piano & Reading',
    subtitle: 'Sakinleştirici piyano ezgileri',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus Ambient',
    subtitle: 'Derin konsantrasyon & atmosferik',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
  },
];

interface SpotifyPlayerProps {
  isZenMode: boolean;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ isZenMode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>(() => {
    const saved = localStorage.getItem('rwm_spotify_embed');
    // If no saved embed or if it was the old broken playlist, default to Lofi Girl
    if (!saved || saved.includes('37i9dQZF1DX3qCx52SuA2W')) {
      return PRESET_PLAYLISTS[0].embedUrl;
    }
    return saved;
  });
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const saved = localStorage.getItem('rwm_spotify_embed');
    const matched = PRESET_PLAYLISTS.find(p => p.embedUrl === saved);
    return matched ? matched.id : PRESET_PLAYLISTS[0].id;
  });

  // Convert regular Spotify link or Playlist ID to official embed URL (no token/API needed)
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = customInput.trim();
    if (!raw) return;

    try {
      let embed = raw;
      
      // If user pasted a raw Playlist ID
      if (!embed.includes('spotify.com') && /^[a-zA-Z0-9]{15,35}$/.test(embed)) {
        embed = `https://open.spotify.com/embed/playlist/${embed}?utm_source=generator&theme=0`;
      } else if (embed.includes('<iframe')) {
        // If user pasted full iframe tag
        const srcMatch = embed.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          embed = srcMatch[1];
        }
      } else if (embed.includes('open.spotify.com')) {
        // If user pasted regular spotify url
        if (!embed.includes('/embed/')) {
          embed = embed.replace('open.spotify.com/', 'open.spotify.com/embed/');
        }
        if (!embed.includes('theme=0')) {
          embed += (embed.includes('?') ? '&' : '?') + 'theme=0';
        }
      } else {
        setInputError('Lütfen geçerli bir Spotify çalma listesi bağlantısı veya ID girin');
        return;
      }

      setCurrentEmbedUrl(embed);
      localStorage.setItem('rwm_spotify_embed', embed);
      setSelectedPreset('custom');
      setShowCustomInput(false);
      setInputError('');
      audioManager.playSoftClick();
    } catch {
      setInputError('Bağlantı işlenirken bir sorun oluştu');
    }
  };

  if (isZenMode) return null;

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 w-72 md:w-80">
        {/* Header Bar */}
        <div
          onClick={() => {
            audioManager.playSoftClick();
            setIsOpen(!isOpen);
          }}
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Music className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                Spotify Müzik
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                {selectedPreset === 'custom'
                  ? 'Özel Playlist'
                  : PRESET_PLAYLISTS.find(p => p.id === selectedPreset)?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
              aria-label={isOpen ? "Oynatıcıyı Küçült" : "Oynatıcıyı Aç"}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-3 pt-1 border-t border-white/5 space-y-2.5 animate-fade-in">
            {/* Embedded Spotify Player iframe */}
            <div className="rounded-xl overflow-hidden shadow-inner bg-black/40 border border-white/5">
              <iframe
                src={currentEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Lo-Fi Player"
                className="w-full rounded-xl"
              />
            </div>

            {/* Presets selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Önerilen Lo-Fi Listeleri
                </span>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline transition-colors"
                >
                  <LinkIcon className="w-2.5 h-2.5" />
                  {showCustomInput ? 'İptal' : 'Kendi Listeni Ekle'}
                </button>
              </div>

              {/* Custom URL Input Form */}
              {showCustomInput ? (
                <form onSubmit={handleApplyCustomUrl} className="pt-0.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Spotify playlist veya albüm linki..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Yükle
                    </button>
                  </div>
                  {inputError && (
                    <p className="text-[10px] text-rose-400 mt-1 pl-1">{inputError}</p>
                  )}
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_PLAYLISTS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        setCurrentEmbedUrl(preset.embedUrl);
                        localStorage.setItem('rwm_spotify_embed', preset.embedUrl);
                        audioManager.playSoftClick();
                      }}
                      className={`text-left p-1.5 rounded-lg transition-all border ${
                        selectedPreset === preset.id
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-[11px] font-medium truncate">{preset.title.split('-')[0]}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{preset.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
};
