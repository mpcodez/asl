import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { ASLTerm } from '../types';

interface ASLVideoPopoverProps {
  term: ASLTerm | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ASLVideoPopover({ term, anchorRect, onClose, onMouseEnter, onMouseLeave }: ASLVideoPopoverProps) {
  const [activeTab, setActiveTab] = useState<'sign' | 'definition'>('sign');
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Position popover relative to anchor rectangular element
  useEffect(() => {
    if (!anchorRect) return;

    const popoverWidth = 340;
    const popoverHeight = 290;
    const padding = 12;

    // Default positioning is centered below the word
    let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
    let top = anchorRect.bottom + padding;

    // Prevent off-screen left/right
    if (left < padding) {
      left = padding;
    } else if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }

    // If there is not enough space below, place above the word
    if (top + popoverHeight > window.innerHeight - padding) {
      top = anchorRect.top - popoverHeight - padding;
    }

    // Take scroll offsets into account
    setCoords({
      top: top + window.scrollY,
      left: left + window.scrollX,
    });
    
    // Reset video state
    setVideoError(false);
  }, [anchorRect]);

  const [triedSources, setTriedSources] = useState<string[]>([]);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  // Generate candidates
  useEffect(() => {
    if (!term) return;

    const termKey = term.id;
    const normalizedWord = termKey.toLowerCase().trim().replace(/\s+/g, '_');
    const normalizedWordSpace = termKey.toLowerCase().trim().replace(/_/g, ' ');

    let candidates: string[] = [];

    if (activeTab === 'sign') {
      candidates = [
        `/quantum_asl_videos/signs/${normalizedWord}_sign.mp4`,
        `/quantum_asl_videos/signs/${normalizedWord}_definition.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWord}_sign.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWord}_definition.mp4`,
        `/quantum_asl_videos/signs/${normalizedWord}.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWord}.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}_sign.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}_definition.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}_sign.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}_definition.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}.mp4`,
      ];
    } else {
      candidates = [
        `/quantum_asl_videos/definitions/${normalizedWord}_definition.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWord}_sign.mp4`,
        `/quantum_asl_videos/signs/${normalizedWord}_definition.mp4`,
        `/quantum_asl_videos/signs/${normalizedWord}_sign.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWord}.mp4`,
        `/quantum_asl_videos/signs/${normalizedWord}.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}_definition.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}_sign.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}_definition.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}_sign.mp4`,
        `/quantum_asl_videos/definitions/${normalizedWordSpace}.mp4`,
        `/quantum_asl_videos/signs/${normalizedWordSpace}.mp4`,
      ];
    }

    // fallback standard paths from types
    if (term.signVideo) candidates.push(term.signVideo.startsWith('/') ? term.signVideo : `/${term.signVideo}`);
    if (term.definitionVideo) candidates.push(term.definitionVideo.startsWith('/') ? term.definitionVideo : `/${term.definitionVideo}`);

    const uniqueCandidates = Array.from(new Set(candidates.map(src => {
      return src.replace(/\/+/g, '/');
    })));

    setTriedSources(uniqueCandidates);
    setCurrentSrcIndex(0);
    setVideoError(false);
  }, [term, activeTab]);

  if (!term || !anchorRect) return null;

  const currentVideoSrc = triedSources[currentSrcIndex] || '';

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVideoError = () => {
    if (currentSrcIndex < triedSources.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setVideoError(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          width: '340px',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="z-50 bg-white text-slate-800 rounded-xl border border-slate-200/90 shadow-xl overflow-hidden focus:outline-none"
        id={`asl-popover-${term.id}`}
      >
        {/* Header */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider font-mono">
              {term.word}
            </h4>
          </div>
        </div>

        {/* Video Viewer */}
        <div className="relative bg-[#000000] aspect-video w-full flex flex-col items-center justify-center border-b border-slate-100 overflow-hidden group">
          {!videoError ? (
            <video
              ref={videoRef}
              src={currentVideoSrc || null}
              autoPlay
              muted
              loop
              playsInline
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={handleVideoError}
            />
          ) : (
            /* Fallback graphic explaining the video status and path requirements */
            <div className="absolute inset-0 bg-slate-50 px-4 flex flex-col items-center justify-center text-center p-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-1.5 animate-pulse" />
              <p className="text-xs font-semibold text-slate-700">ASL Video Asset Required</p>
              <p className="text-[10px] text-slate-500 max-w-[280px] mt-1 leading-snug">
                The MP4 file wasn't found at:
                <code className="block mt-1 p-1 bg-white text-indigo-700 rounded text-[9px] font-mono border border-slate-200 select-all truncate">
                  {currentVideoSrc}
                </code>
              </p>
              
              <div className="mt-3 flex gap-1.5">
                <button
                  id={`btn-copy-${term.id}`}
                  onClick={() => handleCopyPath(currentVideoSrc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[9px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-150 rounded border border-indigo-200 transition-all font-mono"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Path'}
                </button>
                <div className="group relative">
                  <div className="flex items-center gap-1 px-2.5 py-1 text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 cursor-help font-mono">
                    <HelpCircle className="w-3 h-3" /> Info
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 text-white text-[9px] rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity leading-relaxed text-left">
                      Drag-and-drop a <code className="text-amber-400">quantum_asl_videos</code> folder matching this structure into your files to see live video playback.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3">
          {/* Definition */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block mb-0.5">
              Concept Definition
            </span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {term.definition}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
