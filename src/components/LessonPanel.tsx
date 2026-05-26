import React, { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { ASLTerm, ASL_GLOSSARY } from '../types';

interface LessonPanelProps {
  onHoverTerm: (termId: string | null, rect: DOMRect | null) => void;
  onSelectTerm: (termId: string) => void;
  activeTermId: string | null;
}

export default function LessonPanel({ onHoverTerm, onSelectTerm, activeTermId }: LessonPanelProps) {
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>, termId: string) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onHoverTerm(termId, rect);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    onHoverTerm(null, null);
  };

  const renderTerm = (termId: string, customLabel?: string) => {
    const term = ASL_GLOSSARY[termId];
    if (!term) return <span>{customLabel || termId}</span>;
    
    const isActive = activeTermId === termId;
    return (
      <span
        id={`term-trigger-${termId}`}
        onMouseEnter={(e) => handleMouseEnter(e, termId)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onHoverTerm(termId, rect);
          onSelectTerm(termId);
        }}
        className={`inline-block cursor-help transition-all duration-150 rounded px-1.5 py-0.5 border-b-2 font-mono font-semibold text-xs ${
          isActive
            ? 'bg-indigo-600 text-white border-indigo-800 scale-105 shadow-sm'
            : 'text-indigo-600 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-solid hover:text-indigo-700'
        }`}
      >
        {customLabel || term.word}
      </span>
    );
  };

  const chapters = [
    {
      title: "1. The Diamond Network",
      subtitle: "Diamond Crystals & Mistakes",
      terms: ['crystal', 'diamond', 'covalent_bond', 'defect', 'charge'],
      content: (
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            Think of a pure, clear {renderTerm('crystal')} of solid {renderTerm('diamond')}. Deep inside, carbon atoms connect with each other using very strong {renderTerm('covalent_bond', 'covalent bonds')} to build a sturdy, repeating cage.
          </p>
          <p>
            Sometimes, there is a minute mistake in this perfect cage. We call that a point {renderTerm('defect')}.
          </p>
          <p>
            For a <strong>Nitrogen-Vacancy (NV) Center</strong>, we do two things: swap one carbon atom with a Nitrogen atom, and leave the spot right next to it empty (a Vacancy).
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 my-1">
            <h5 className="text-xs font-semibold text-indigo-600 font-mono mb-1">Trapping Electrons</h5>
            <p className="text-xs text-slate-650 leading-relaxed">
              This empty spot acts like a tiny box inside the diamond, trapping negative electric {renderTerm('charge', 'electrons')}. Because they are sealed inside the diamond cage, they stay safe from external noise, creating a tiny quantum laboratory!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "2. Light & Energy Stages",
      subtitle: "Laser Pumping & Glow Cycles",
      terms: ['laser', 'wavelength', 'ground_state', 'excited_state', 'photoluminescence', 'cycle'],
      content: (
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            Our trapped electrons normally sit in their quietest, lowest energy level, called the {renderTerm('ground_state')}.
          </p>
          <p>
            When we fire a green {renderTerm('laser')} with a 532 nm {renderTerm('wavelength')}, the electrons absorb this power. This forces them to jump up to a high-energy level called the {renderTerm('excited_state')}.
          </p>
          <p>
            They cannot stay up there forever. After a few nanoseconds, they drop back down to rest. When they fall, they release that energy as a beautiful red glow. This process is called {renderTerm('photoluminescence')}.
          </p>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed">
            <strong>The Glow Cycle:</strong> Repeating this green light absorption and red light release is our core {renderTerm('cycle')}. We count the resulting red light particles to measure what the electron is doing.
          </div>
        </div>
      ),
    },
    {
      title: "3. What is Quantum Spin?",
      subtitle: "The Subatomic Magnetic Toy",
      terms: ['spin_quantum', 'electromagnetism'],
      content: (
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            Electrons have a special quantum feature called {renderTerm('spin_quantum', 'electron spin')}. Think of spin as a tiny magnetic toy top that spins and acts like a tiny compass needle.
          </p>
          <p>
            In our defect, we look at two main directions for this needle:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-650">
            <li>
              <strong>Active State (spin = 0):</strong> The needle points straight. The red glow cycle is highly active and stays very bright.
            </li>
            <li>
              <strong>Dim State (spin = ±1):</strong> The needle is tilted. Tilted electrons take a quiet, dark shortcut back down, skipping light release. Thus, the red glow dims!
            </li>
          </ul>
          <p>
            By looking at how bright the red light is, we instantly know which way our tiny compass is pointing using the forces of {renderTerm('electromagnetism')}.
          </p>
        </div>
      ),
    },
    {
      title: "4. Microwave Spin-Flips",
      subtitle: "Tuning Microwaves Directly",
      terms: ['frequency', 'amplitude', 'sinusoidal'],
      content: (
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            How do we tilt our tiny compass needle from the bright spin 0 state to the dim spin ±1 state? We use microwaves!
          </p>
          <p>
            Microwaves are invisible radio signals with a smooth, curving {renderTerm('sinusoidal')} wave shape. 
          </p>
          <p>
            These waves only affect the electron if we tune their vibration speed ({renderTerm('frequency')}) to exactly <strong>2.87 GHz</strong> (2.87 billion beats per second). At this frequency, the microwave matches the energy gap and flips the spin!
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-normal text-slate-600">
            <strong>Controlling States:</strong> By changing the microwave power ({renderTerm('amplitude')}), we can control how strongly the spin is flipped. Try turning microwaves on in the sandbox!
          </div>
        </div>
      ),
    },
    {
      title: "5. Sensing Magnetic Fields",
      subtitle: "The Quantum Micro-Compass",
      terms: ['difference'],
      content: (
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            Because our spin acts like a tiny magnet, it is incredibly sensitive to any nearby magnetic fields!
          </p>
          <p>
            If we bring an external magnet close, the magnetic fields push the tilted spin +1 state and spin -1 state apart into different energy levels.
          </p>
          <p>
            Now, the single resonance dip splits into two separate dips.
          </p>
          <p>
            The mathematical {renderTerm('difference')} between these two new dips is directly proportional to how strong the magnetic field is! This split allows scientists to build the world's most sensitive microscopic magnetic detectors.
          </p>
        </div>
      ),
    },
  ];

  // Filter glossary terms to only present words actively introduced in this chapter
  const currentChapterTerms = chapters[activeChapter].terms;
  const filteredGlossary = Object.values(ASL_GLOSSARY).filter(term => 
    currentChapterTerms.includes(term.id)
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" id="lesson-panel-root">
      {/* Tab Navigation header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
          SELECT CHAPTER:
        </span>
        <div className="flex gap-1.5">
          {chapters.map((_, idx) => (
            <button
              key={idx}
              id={`btn-chapter-${idx}`}
              onClick={() => setActiveChapter(idx)}
              className={`w-7 h-2 rounded-full transition-all ${
                activeChapter === idx ? 'bg-indigo-600 w-9' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Go to Chapter ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Chapter Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
            {chapters[activeChapter].title}
          </h3>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          {chapters[activeChapter].content}
        </div>
      </div>

      {/* Glossary Reference quick index */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Chapter {activeChapter + 1} ASL Terms
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {filteredGlossary.map((term) => (
            <button
              key={term.id}
              id={`quick-term-${term.id}`}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onHoverTerm(term.id, rect);
                onSelectTerm(term.id);
              }}
              className={`px-2 py-1 text-[10px] rounded border font-mono transition-all duration-150 ${
                activeTermId === term.id
                  ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/20'
              }`}
            >
              {term.word}
            </button>
          ))}
        </div>
      </div>

      {/* Progression Control */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 font-mono">
        <span>
          Page {activeChapter + 1} of {chapters.length}
        </span>
        <button
          id="btn-next-chapter"
          onClick={() => setActiveChapter((prev) => (prev + 1) % chapters.length)}
          className="flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700 active:scale-95 transition-all text-xs"
        >
          {activeChapter === chapters.length - 1 ? "Start Over" : "Next Chapter"} <ChevronRight className="w-4 h-4 animate-[bounce_2s_infinite]" />
        </button>
      </div>
    </div>
  );
}
