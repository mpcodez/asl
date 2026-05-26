import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import LessonPanel from './components/LessonPanel';
import SimulationSandbox from './components/SimulationSandbox';
import ASLVideoPopover from './components/ASLVideoPopover';
import { ASLTerm, ASL_GLOSSARY } from './types';

export default function App() {
  const [activeTerm, setActiveTerm] = useState<ASLTerm | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const closeTimeoutIdRef = useRef<number | null>(null);

  const handleHoverTerm = (termId: string | null, rect: DOMRect | null) => {
    if (!termId) {
      // Delay closing of popover
      if (closeTimeoutIdRef.current !== null) {
        window.clearTimeout(closeTimeoutIdRef.current);
      }
      closeTimeoutIdRef.current = window.setTimeout(() => {
        setActiveTerm(null);
        setAnchorRect(null);
        closeTimeoutIdRef.current = null;
      }, 250);
    } else {
      // Clear close timeout if we hover a term
      if (closeTimeoutIdRef.current !== null) {
        window.clearTimeout(closeTimeoutIdRef.current);
        closeTimeoutIdRef.current = null;
      }
      const term = ASL_GLOSSARY[termId];
      if (term) {
        setActiveTerm(term);
        setAnchorRect(rect);
      }
    }
  };

  const handleSelectTerm = (termId: string) => {
    if (closeTimeoutIdRef.current !== null) {
      window.clearTimeout(closeTimeoutIdRef.current);
      closeTimeoutIdRef.current = null;
    }
    const term = ASL_GLOSSARY[termId];
    if (term) {
      setActiveTerm(term);
    }
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimeoutIdRef.current !== null) {
      window.clearTimeout(closeTimeoutIdRef.current);
      closeTimeoutIdRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    if (closeTimeoutIdRef.current !== null) {
      window.clearTimeout(closeTimeoutIdRef.current);
    }
    closeTimeoutIdRef.current = window.setTimeout(() => {
      setActiveTerm(null);
      setAnchorRect(null);
      closeTimeoutIdRef.current = null;
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col selection:bg-indigo-100 selection:text-indigo-950" id="app-container-root">
      
      {/* Brilliant.com style Minimalist Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Interactive Lab
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-1 font-sans">
            <span className="text-indigo-600 font-bold">Quantum ASL</span> Explorer
          </h1>
        </div>
        

      </header>

      {/* Main interactive application panels */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        
        {/* Master layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Panel column :: Written Lesson material */}
          <div className="col-span-1 lg:col-span-5 flex flex-col">
            <LessonPanel
              onHoverTerm={handleHoverTerm}
              onSelectTerm={handleSelectTerm}
              activeTermId={activeTerm?.id || null}
            />
          </div>

          {/* Right Panel column :: Interactive Simulation Sandbox */}
          <div className="col-span-1 lg:col-span-7 flex flex-col">
            <SimulationSandbox />
          </div>
        </div>

        {/* Minimalist modern educational footer */}
        <footer className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center items-center text-slate-550 text-[11px] mt-auto text-center font-medium">
          <span>
            Quantum ASL Explorer - developed by Medha Pappula in 2026 as a part of TJHSST Electrodynamics and Quantum Mechanics course
          </span>
        </footer>
      </main>

      {/* Floating interactive Popover */}
      {activeTerm && anchorRect && (
        <ASLVideoPopover
          term={activeTerm}
          anchorRect={anchorRect}
          onClose={() => handleHoverTerm(null, null)}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        />
      )}
    </div>
  );
}
