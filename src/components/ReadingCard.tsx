import React, { useState } from 'react';
import { BookOpen, RefreshCw, BookmarkCheck, Feather } from 'lucide-react';
import type { Quote } from '../types';
import { getRandomQuote } from '../utils/quotes';
import { audioManager } from '../utils/audio';

interface ReadingCardProps {
  isZenMode: boolean;
}

export const ReadingCard: React.FC<ReadingCardProps> = ({ isZenMode }) => {
  const [quote, setQuote] = useState<Quote>(getRandomQuote());
  const [bookTitle, setBookTitle] = useState('Dönüşüm');
  const [author, setAuthor] = useState('Franz Kafka');
  const [currentPage, setCurrentPage] = useState('42');
  const [isEditing, setIsEditing] = useState(false);

  const handleNextQuote = () => {
    audioManager.playSoftClick();
    setQuote(getRandomQuote());
  };

  if (isZenMode) return null;

  return (
    <div className="max-w-sm w-full glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 border border-white/10 shadow-2xl space-y-3 animate-fade-in pointer-events-auto">
      {/* Book Tracker */}
      <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Kitap Adı"
                  className="bg-black/40 border border-white/20 rounded px-2 py-0.5 text-xs text-white font-medium"
                />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Yazar"
                  className="bg-black/40 border border-white/20 rounded px-2 py-0.5 text-[10px] text-zinc-300 block"
                />
              </div>
            ) : (
              <>
                <h3 className="text-xs font-semibold text-white tracking-wide">{bookTitle || 'Okuduğun Kitap'}</h3>
                <p className="text-[11px] text-zinc-400 font-serif italic">{author || 'Yazar'}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400">Sayfa:</span>
              <input
                type="text"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                className="w-10 bg-black/40 border border-white/20 rounded px-1 py-0.5 text-xs text-center text-amber-300 font-mono"
              />
              <button
                onClick={() => {
                  setIsEditing(false);
                  audioManager.playSoftClick();
                }}
                className="px-2 py-0.5 rounded-lg bg-amber-500/30 text-amber-200 text-xs font-medium"
              >
                Tamam
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                audioManager.playSoftClick();
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-colors"
              title="Kitap ve sayfa bilgisi düzenle"
            >
              <BookmarkCheck className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-amber-300 text-xs">s. {currentPage}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quote Section */}
      <div className="relative pt-0.5">
        <div className="flex items-start gap-2">
          <Feather className="w-3.5 h-3.5 text-amber-400/70 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 w-full">
            <p className="text-[11px] md:text-xs text-stone-200 font-serif leading-relaxed italic">
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] sm:text-[11px] text-amber-300/80 font-medium">
                — {quote.author} {quote.book && <span className="text-zinc-500">({quote.book})</span>}
              </span>
              <button
                onClick={handleNextQuote}
                className="p-1 rounded-md text-zinc-500 hover:text-amber-300 hover:bg-white/5 transition-colors"
                title="Yeni alıntı getir"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
