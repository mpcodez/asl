import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Sliders, Radio, Sparkles, Magnet } from 'lucide-react';
import { SimState, SpinState } from '../types';

export default function SimulationSandbox() {
  // Main simulation state following the simplified guidelines
  const [simState, setSimState] = useState<SimState>({
    laserPower: 70,
    laserOn: false,
    microwaveOn: false,
    microwaveFrequency: 2.870, // 2.870 GHz is default resonance
    activeEnergyState: 'ground',
    spinState: '0',
    fluorescenceLevel: 0,
    temperature: 293, // default room temp
    magneticField: 0.0, // mT (magnetic field strength)
  });

  const [isResonant, setIsResonant] = useState(false);
  const [resonantLabel, setResonantLabel] = useState<string>('');

  const latticeCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Particle systems for visual photons
  const greenPhotons = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[]>([]);
  const redPhotons = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[]>([]);

  // Split calculation based on Zeeman effect (28 MHz = 0.028 GHz shift per mT)
  const getDips = (bField: number) => {
    const shift = 0.022 * bField; // shift per unit
    if (bField === 0) {
      return [2.870];
    }
    return [2.870 - shift, 2.870 + shift];
  };

  // Determine if microwave is sitting at a resonance dip
  useEffect(() => {
    if (!simState.microwaveOn) {
      setIsResonant(false);
      setResonantLabel('');
      setSimState(prev => ({ ...prev, spinState: '0' }));
      return;
    }

    const dips = getDips(simState.magneticField);
    const tolerance = 0.007; // GHz window around dip

    let matchesDip = false;
    let matchValue = 2.870;

    for (const d of dips) {
      if (Math.abs(simState.microwaveFrequency - d) < tolerance) {
        matchesDip = true;
        matchValue = d;
        break;
      }
    }

    if (matchesDip) {
      setIsResonant(true);
      if (simState.magneticField === 0) {
        setResonantLabel(`Resonance reached at ${matchValue.toFixed(3)} GHz!`);
        setSimState(prev => ({ ...prev, spinState: '±1' }));
      } else {
        const lowerRes = 2.870 - 0.022 * simState.magneticField;
        const isLower = Math.abs(simState.microwaveFrequency - lowerRes) < tolerance;
        setResonantLabel(`Zeeman Split Resonance (${isLower ? 'm_s = -1' : 'm_s = +1'}) at ${matchValue.toFixed(3)} GHz!`);
        setSimState(prev => ({ ...prev, spinState: isLower ? '-1' : '+1' }));
      }
    } else {
      setIsResonant(false);
      setResonantLabel('');
      setSimState(prev => ({ ...prev, spinState: '0' }));
    }
  }, [simState.microwaveOn, simState.microwaveFrequency, simState.magneticField]);

  // Adjust fluorescence brightness based on laser and microwave resonance
  useEffect(() => {
    if (!simState.laserOn) {
      setSimState(prev => ({ ...prev, fluorescenceLevel: 0, activeEnergyState: 'ground' }));
      return;
    }

    // Normal bright state is directly related to laser power
    let brightness = (simState.laserPower / 100) * 90;

    // IF MICROWAVE RESONANCE IS ACTIVE, DIM SHARPLY (80% drop in brightness!)
    if (isResonant) {
      brightness = brightness * 0.15; // Plummets to a dark state!
    }

    setSimState(prev => ({
      ...prev,
      fluorescenceLevel: brightness,
      activeEnergyState: isResonant ? 'metastable' : 'excited'
    }));
  }, [simState.laserOn, simState.laserPower, isResonant]);

  // 60FPS Draw Loop
  useEffect(() => {
    const latCanvas = latticeCanvasRef.current;
    const chartCanvas = chartCanvasRef.current;
    if (!latCanvas || !chartCanvas) return;

    const ctxL = latCanvas.getContext('2d');
    const ctxC = chartCanvas.getContext('2d');
    if (!ctxL || !ctxC) return;

    let frameId: number;

    const render = () => {
      // 1. RENDER DEMONSTRATION VIEWPORT (Laser color conversion) - LIGHT MODE BACKGROUND
      ctxL.fillStyle = '#ffffff';
      ctxL.fillRect(0, 0, latCanvas.width, latCanvas.height);

      const centerX = latCanvas.width / 2;
      const centerY = latCanvas.height / 2;
      const spacing = 45;

      // Rigid covalent crystal arrangement of carbon diamond
      const carbonGrid = [
        { dx: -1.5, dy: -1.2, element: 'C' },
        { dx: -0.5, dy: -1.2, element: 'C' },
        { dx: 0.5, dy: -1.2, element: 'C' },
        { dx: 1.5, dy: -1.2, element: 'C' },

        { dx: -1.0, dy: -0.3, element: 'C' },
        { dx: 0.0, dy: -0.3, element: 'N' }, // Substitution Nitrogen
        { dx: 1.0, dy: -0.3, element: 'C' },

        { dx: -1.5, dy: 0.6, element: 'C' },
        { dx: -0.5, dy: 0.6, element: 'V' }, // Vacancy defect (optical trap center)
        { dx: 0.5, dy: 0.6, element: 'C' },
        { dx: 1.5, dy: 0.6, element: 'C' },

        { dx: -1.0, dy: 1.5, element: 'C' },
        { dx: 0.0, dy: 1.5, element: 'C' },
        { dx: 1.0, dy: 1.5, element: 'C' },
      ];

      // Draw rigid lattice bonds in light mode - clean slate grey lines
      ctxL.strokeStyle = '#e2e8f0';
      ctxL.lineWidth = 1.8;
      for (let i = 0; i < carbonGrid.length; i++) {
        const atomA = carbonGrid[i];
        const ax = centerX + atomA.dx * spacing;
        const ay = centerY + atomA.dy * spacing;

        for (let j = i + 1; j < carbonGrid.length; j++) {
          const atomB = carbonGrid[j];
          const bx = centerX + atomB.dx * spacing;
          const by = centerY + atomB.dy * spacing;

          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (dist < spacing * 1.6) {
            ctxL.beginPath();
            ctxL.moveTo(ax, ay);
            ctxL.lineTo(bx, by);
            ctxL.stroke();
          }
        }
      }

      // Draw chemical atoms
      carbonGrid.forEach((atom) => {
        const ax = centerX + atom.dx * spacing;
        const ay = centerY + atom.dy * spacing;

        if (atom.element === 'C') {
          // Carbon atoms - modern slate grey layout
          const grad = ctxL.createRadialGradient(ax - 1.5, ay - 1.5, 1, ax, ay, 6);
          grad.addColorStop(0, '#cbd5e1');
          grad.addColorStop(1, '#64748b');
          ctxL.fillStyle = grad;
          ctxL.beginPath();
          ctxL.arc(ax, ay, 6.5, 0, Math.PI * 2);
          ctxL.fill();
        } else if (atom.element === 'N') {
          // Nitrogen replacement - glowing warm orange-amber
          const grad = ctxL.createRadialGradient(ax - 2, ay - 2, 1, ax, ay, 9);
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, '#c2410c');
          ctxL.fillStyle = grad;
          ctxL.beginPath();
          ctxL.arc(ax, ay, 9, 0, Math.PI * 2);
          ctxL.fill();

          ctxL.fillStyle = '#ffffff';
          ctxL.font = 'bold 8.5px sans-serif';
          ctxL.textAlign = 'center';
          ctxL.textBaseline = 'middle';
          ctxL.fillText('N', ax, ay);
        } else if (atom.element === 'V') {
          // Vacancy hollow core - clean royal blue
          ctxL.strokeStyle = '#2563eb';
          ctxL.lineWidth = 1.8;
          ctxL.setLineDash([2.5, 2.5]);
          ctxL.beginPath();
          ctxL.arc(ax, ay, 10, 0, Math.PI * 2);
          ctxL.stroke();
          ctxL.setLineDash([]);

          ctxL.fillStyle = '#2563eb';
          ctxL.font = 'bold 8.5px sans-serif';
          ctxL.textAlign = 'center';
          ctxL.textBaseline = 'middle';
          ctxL.fillText('V', ax, ay);
        }
      });

      const nvCoords = {
        x: centerX + (-0.25) * spacing,
        y: centerY + (0.15) * spacing
      };

      // A) SHINE EXCITATION GREEN LASER INCOMING
      const emitterX = 35;
      const emitterY = centerY - 25;

      if (simState.laserOn) {
        // Render bright green beam
        ctxL.beginPath();
        const beamGrad = ctxL.createLinearGradient(emitterX, emitterY, nvCoords.x, nvCoords.y);
        beamGrad.addColorStop(0, 'rgba(34, 197, 94, 0.95)');
        beamGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.5)');
        beamGrad.addColorStop(1, 'rgba(22, 163, 74, 0.95)');

        ctxL.strokeStyle = beamGrad;
        ctxL.lineWidth = 3.5 + (simState.laserPower / 30);
        ctxL.moveTo(emitterX, emitterY);
        ctxL.lineTo(nvCoords.x, nvCoords.y);
        ctxL.stroke();

        // Green light glow halo
        ctxL.strokeStyle = 'rgba(74, 222, 128, 0.12)';
        ctxL.lineWidth = ctxL.lineWidth + 8;
        ctxL.stroke();

        // Emit input green light photons
        if (Math.random() < 0.38) {
          greenPhotons.current.push({
            x: emitterX,
            y: emitterY,
            vx: (nvCoords.x - emitterX) / 35 + (Math.random() - 0.5) * 0.8,
            vy: (nvCoords.y - emitterY) / 35 + (Math.random() - 0.5) * 0.8,
            life: 0,
            maxLife: 35
          });
        }
      }

      // Draw Green Light Box Source in clean light format
      ctxL.fillStyle = '#f0fdf4';
      ctxL.strokeStyle = '#22c55e';
      ctxL.lineWidth = 1.8;
      ctxL.beginPath();
      ctxL.roundRect(8, emitterY - 14, 32, 28, 6);
      ctxL.fill();
      ctxL.stroke();

      ctxL.fillStyle = '#15803d';
      ctxL.font = 'bold 8.5px monospace';
      ctxL.textAlign = 'center';
      ctxL.fillText('LASER', 24, emitterY - 3);
      ctxL.fillText('532nm', 24, emitterY + 7);

      // Render flowing input green light particles
      greenPhotons.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        ctxL.fillStyle = '#22c55e';
        ctxL.beginPath();
        ctxL.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctxL.fill();
      });
      greenPhotons.current = greenPhotons.current.filter(p => p.life < p.maxLife);

      // B) SHINE FLUORESCENT RED LIGHT OUT TO DETECTOR
      const detectorX = latCanvas.width - 45;
      const detectorY = 45;

      // Red Photodetector Box (friendly light mode container)
      ctxL.fillStyle = simState.laserOn ? '#fef2f2' : '#f8fafc';
      ctxL.strokeStyle = simState.laserOn ? '#ef4444' : '#cbd5e1';
      ctxL.lineWidth = 1.8;
      ctxL.beginPath();
      ctxL.roundRect(detectorX - 35, detectorY - 18, 70, 38, 6);
      ctxL.fill();
      ctxL.stroke();

      ctxL.fillStyle = '#475569';
      ctxL.font = 'bold 8px monospace';
      ctxL.textAlign = 'center';
      ctxL.fillText('RED DETECTOR', detectorX, detectorY - 6);

      ctxL.fillStyle = simState.laserOn ? '#b91c1c' : '#64748b';
      ctxL.font = 'bold 10px monospace';
      const readVal = simState.laserOn ? simState.fluorescenceLevel.toFixed(1) : '0.0';
      ctxL.fillText(`${readVal} kcps`, detectorX, detectorY + 6);
      
      ctxL.fillStyle = '#94a3b8';
      ctxL.font = '6.5px monospace';
      ctxL.fillText('Glow Rate', detectorX, detectorY + 14);

      // Spin status physical marker at NV Center
      if (simState.laserOn) {
        // Draw the glowing excited cloud surrounding the NV Center
        const glowRad = 15 + (simState.fluorescenceLevel / 100) * 35;
        const glowGrad = ctxL.createRadialGradient(nvCoords.x, nvCoords.y, 3, nvCoords.x, nvCoords.y, glowRad);
        
        if (isResonant) {
          // Dim state - soft deep crimson-rose halo
          glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
          glowGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
          glowGrad.addColorStop(1, 'transparent');
        } else {
          // Bright state - bright vibrant pinkish red halo
          glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
          glowGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.25)');
          glowGrad.addColorStop(1, 'transparent');
        }

        ctxL.fillStyle = glowGrad;
        ctxL.beginPath();
        ctxL.arc(nvCoords.x, nvCoords.y, glowRad, 0, Math.PI * 2);
        ctxL.fill();

        // Pulse outward rings for waves
        ctxL.strokeStyle = isResonant ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.22)';
        ctxL.lineWidth = 1;
        ctxL.beginPath();
        ctxL.arc(nvCoords.x, nvCoords.y, 10 + (Date.now() / 25) % 30, 0, Math.PI * 2);
        ctxL.stroke();

        // Emit red physical particles directly correlating to the fluorescence brightness
        const spawnProb = isResonant ? 0.08 : 0.42;
        if (Math.random() < spawnProb) {
          redPhotons.current.push({
            x: nvCoords.x,
            y: nvCoords.y,
            vx: (detectorX - nvCoords.x) / 50 + (Math.random() - 0.5) * 1.8,
            vy: (detectorY - nvCoords.y) / 50 + (Math.random() - 0.5) * 1.8,
            life: 0,
            maxLife: 50
          });
        }

        // Draw State badge on the canvas
        ctxL.fillStyle = isResonant ? '#991b1b' : '#334155';
        ctxL.font = 'bold 9px monospace';
        ctxL.textAlign = 'left';
        ctxL.fillText(isResonant ? 'STATE: DIM (m_s=±1, skipping light)' : 'STATE: BRIGHT (m_s=0, full glow loop)', 12, latCanvas.height - 12);
      }

      // Render outgoing transformed red photons
      redPhotons.current.forEach((rp) => {
        rp.x += rp.vx;
        rp.y += rp.vy;
        rp.life++;
        
        const ratio = 1 - rp.life / rp.maxLife;
        ctxL.fillStyle = isResonant 
          ? `rgba(185, 28, 28, ${ratio * 0.45})` 
          : `rgba(239, 68, 68, ${ratio * 0.85})`;
        
        ctxL.beginPath();
        const offset = Math.sin(rp.life / 3) * 2;
        ctxL.arc(rp.x + offset, rp.y, isResonant ? 2.5 : 4, 0, Math.PI * 2);
        ctxL.fill();
      });
      redPhotons.current = redPhotons.current.filter(rp => rp.life < rp.maxLife);

      // C) RADIO MICROWAVES FIELD EFFECT - INDIGO / VIOLET RAYS FOR FRIENDLY LIGHT DESIGN
      if (simState.microwaveOn) {
        ctxL.strokeStyle = isResonant ? 'rgba(79, 70, 229, 0.45)' : 'rgba(99, 102, 241, 0.12)';
        ctxL.lineWidth = isResonant ? 2 : 1;
        const rad = (Date.now() / 10) % 160;
        ctxL.beginPath();
        ctxL.arc(nvCoords.x, nvCoords.y, rad, 0, Math.PI * 2);
        ctxL.stroke();

        ctxL.beginPath();
        ctxL.arc(nvCoords.x, nvCoords.y, (rad + 80) % 160, 0, Math.PI * 2);
        ctxL.stroke();

        // Glowing center target
        if (isResonant) {
          ctxL.strokeStyle = '#4f46e5';
          ctxL.beginPath();
          ctxL.arc(nvCoords.x, nvCoords.y, 14, 0, Math.PI * 2);
          ctxL.stroke();

          ctxL.fillStyle = '#4f46e5';
          ctxL.font = 'bold 9px monospace';
          ctxL.textAlign = 'center';
          ctxL.fillText('🎯 RESONANT SPIN FLIP', centerX, 25);
        }
      }


      // 2. RENDER THE INTERACTIVE WAVE TUNING GRAPH - LIGHT MODE CLEAN LAYOUT
      ctxC.fillStyle = '#ffffff';
      ctxC.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

      // Draw soft grey Gridlines
      ctxC.strokeStyle = '#f1f5f9';
      ctxC.lineWidth = 1;
      for (let x = 0; x < chartCanvas.width; x += 50) {
        ctxC.beginPath();
        ctxC.moveTo(x, 0);
        ctxC.lineTo(x, chartCanvas.height);
        ctxC.stroke();
      }
      for (let y = 0; y < chartCanvas.height; y += 25) {
        ctxC.beginPath();
        ctxC.moveTo(0, y);
        ctxC.lineTo(chartCanvas.width, y);
        ctxC.stroke();
      }

      // X range: 2.800 (x=0) to 2.940 (x=width)
      const fMin = 2.800;
      const fMax = 2.940;
      
      const getXForF = (f: number) => {
        return ((f - fMin) / (fMax - fMin)) * chartCanvas.width;
      };

      const getFForX = (x: number) => {
        return fMin + (x / chartCanvas.width) * (fMax - fMin);
      };

      // Draw the dip curve line (Resonance profile)
      ctxC.beginPath();
      ctxC.strokeStyle = '#ef4444'; // clean red line for dip graphs
      ctxC.lineWidth = 2.5;

      const dips = getDips(simState.magneticField);

      for (let x = 0; x <= chartCanvas.width; x++) {
        const f = getFForX(x);
        let intensityFactor = 1.0; 

        dips.forEach((dip) => {
          const delta = f - dip;
          const dipDepth = 0.82; // drops by 82% at deep bottom
          const dipWidth = 0.007; // width factor
          const strength = dipDepth / (1.0 + (delta / dipWidth) ** 2);
          intensityFactor -= strength;
        });

        // Clamp intensity
        intensityFactor = Math.max(0.15, intensityFactor);

        // Convert factor to graph coordinate
        const y = 15 + (1.0 - intensityFactor) * (chartCanvas.height - 35);
        if (x === 0) {
          ctxC.moveTo(x, y);
        } else {
          ctxC.lineTo(x, y);
        }
      }
      ctxC.stroke();

      // Label dips elegantly under light mode
      ctxC.fillStyle = '#dc2626';
      ctxC.font = '9px font-sans';
      ctxC.textAlign = 'center';
      dips.forEach((dip) => {
        const dx = getXForF(dip);
        ctxC.fillStyle = 'rgba(239, 68, 68, 0.07)';
        ctxC.fillRect(dx - 12, 10, 24, chartCanvas.height - 25);
        ctxC.fillStyle = '#dc2626';
        ctxC.fillText(`${dip.toFixed(3)}`, dx, chartCanvas.height - 12);
      });

      // Draw vertical Indigo dashed line representing user's current frequency dial
      const curX = getXForF(simState.microwaveFrequency);
      ctxC.strokeStyle = simState.microwaveOn ? '#4f46e5' : '#94a3b8';
      ctxC.lineWidth = 2;
      ctxC.setLineDash([3, 3]);
      ctxC.beginPath();
      ctxC.moveTo(curX, 0);
      ctxC.lineTo(curX, chartCanvas.height);
      ctxC.stroke();
      ctxC.setLineDash([]);

      // Glow handle at cursor tip
      ctxC.fillStyle = simState.microwaveOn ? '#4f46e5' : '#64748b';
      ctxC.beginPath();
      ctxC.arc(curX, 10, 4, 0, Math.PI * 2);
      ctxC.fill();

      // Horizontal labeling
      ctxC.fillStyle = '#64748b';
      ctxC.font = '8px monospace';
      ctxC.textAlign = 'left';
      ctxC.fillText('2.80 GHz', 5, 20);
      ctxC.textAlign = 'right';
      ctxC.fillText('2.94 GHz', chartCanvas.width - 5, 20);

      // Value label detailing graph in light mode with Slate coloring
      ctxC.textAlign = 'left';
      ctxC.fillStyle = '#475569';
      ctxC.font = 'bold 8.5px font-sans';
      ctxC.fillText('Red Glow rate (Y) vs Microwave tuning Frequency dial (X)', 12, 11);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [simState, isResonant]);

  return (
    <div className="bg-white rounded-2xl border border-slate-205 p-5 space-y-4 shadow-sm overflow-hidden text-slate-800 h-full flex flex-col" id="simulator-sandbox-root">
      
      {/* Title Header - Brilliant Style */}
      <div className="flex justify-between items-center bg-slate-50 -mx-5 -mt-5 p-4 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700 uppercase">
            NV Qubit Sandbox & Laser Resonance Probe
          </h3>
        </div>
      </div>

      {/* Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* Left Aspect: The interactive screens */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Crystal Chamber */}
          <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden aspect-[4/3] flex flex-col shadow-inner">
            <canvas
              ref={latticeCanvasRef}
              width={420}
              height={250}
              className="w-full h-full block"
            />
            {/* Visual Legend */}
            <div className="absolute bottom-2 right-2 bg-slate-50/95 px-2 py-1 rounded-md text-[9px] font-mono border border-slate-200 flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Carbon
              </span>
              <span className="flex items-center gap-1 text-orange-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Nitrogen
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent border border-dashed border-blue-500" /> Vacancy
              </span>
            </div>

            {/* Firing indicators */}
            {simState.laserOn && (
              <div className="absolute top-2 left-2 bg-green-50 border border-green-200 text-green-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-green-600" /> Laser Fired (532 nm)
              </div>
            )}
          </div>

          {/* Interactive Live Resonance Dip Chart */}
          <div className="rounded-xl border border-slate-200 bg-white h-28 overflow-hidden relative flex flex-col">
            <div className="px-2 py-0.5 bg-slate-50 text-slate-500 border-b border-slate-200 font-mono text-[9px] font-semibold flex justify-between items-center select-none">
              <span>FLUORESCENT RED GLOW VS. MICROWAVE SWEEP</span>
              {isResonant && (
                <span className="text-red-650 animate-pulse text-[8px] font-bold">
                  🎯 RESONANT COUPLING – GLOW PLUMMETED
                </span>
              )}
            </div>
            <canvas
              ref={chartCanvasRef}
              width={420}
              height={90}
              className="w-full h-full block"
            />
          </div>

          {/* 3rd Panel: Live Energy State Level Jumping */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col relative" style={{ minHeight: '135px' }}>
            <div className="px-2 py-0.5 bg-slate-100 text-slate-600 border-b border-slate-200/60 font-mono text-[9px] font-semibold flex justify-between items-center -mx-3 -mt-3 mb-3">
              <span>REAL-TIME JUMP MODEL (ELECTRON ORBIT STATES)</span>
              <span className={`text-[8px] font-mono font-bold px-1.5 rounded ${
                !simState.laserOn
                  ? 'bg-slate-200 text-slate-500'
                  : isResonant
                  ? 'bg-orange-50 text-orange-700 border border-orange-250/50'
                  : 'bg-green-50 text-green-700 border border-green-250/50'
              }`}>
                {!simState.laserOn ? 'IDLE REST' : isResonant ? 'METASTABLE COUPLING (DIM)' : 'HIGH OPTICAL EMISSION RECYCLING'}
              </span>
            </div>

            <div className="flex-1 relative h-20 select-none pb-2">
              
              {/* Ground State Level (Bottom Left) */}
              <div 
                className={`absolute left-[4%] bottom-1 w-[38%] h-5 border rounded flex items-center justify-center font-mono text-[9px] font-black transition-all ${
                  simState.laserOn && !isResonant
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : isResonant
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-250 text-slate-500'
                }`}
              >
                Ground State (m_s = 0)
              </div>

              {/* Excited State Level (Top Left) */}
              <div 
                className={`absolute left-[4%] top-1 w-[38%] h-5 border rounded flex items-center justify-center font-mono text-[9px] font-black transition-all ${
                  simState.laserOn && !isResonant
                    ? 'bg-red-50 border-red-200 text-red-600 font-bold'
                    : isResonant
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : 'bg-white border-slate-250 text-slate-500'
                }`}
              >
                Excited State
              </div>

              {/* Metastable Shortcut Level (Center Right) */}
              <div 
                className={`absolute right-[5%] top-[30%] w-[38%] h-5 border rounded flex items-center justify-center font-mono text-[9px] font-black transition-all ${
                  simState.laserOn && isResonant
                    ? 'bg-amber-100/80 border-amber-300 text-amber-800 shadow-sm font-extrabold'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                Dark Path
              </div>

              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {/* 1. Green Laser Up Pump (X positions: Line around left-side, ~9% to ~9%) */}
                <path
                  d="M 45,70 L 45,28"
                  fill="none"
                  stroke={simState.laserOn ? "#22c55e" : "#cbd5e1"}
                  strokeWidth={simState.laserOn ? "2.2" : "1"}
                  strokeDasharray={simState.laserOn ? "2,2" : ""}
                  className={simState.laserOn ? "animate-[pulse_1.5s_infinite]" : ""}
                />

                {/* 2. Red Fluorescence Down Decay (X position: ~35%) */}
                <path
                  d="M 125,28 L 125,70"
                  fill="none"
                  stroke={simState.laserOn && !isResonant ? "#ef4444" : "#cbd5e1"}
                  strokeWidth={simState.laserOn && !isResonant ? "2.2" : "1"}
                  strokeDasharray={simState.laserOn && !isResonant ? "2,2" : ""}
                />

                {/* 3. Dark Shortcut from Excited to Metastable */}
                <path
                  d="M 160,18 L 240,32"
                  fill="none"
                  stroke={simState.laserOn && isResonant ? "#f59e0b" : "#cbd5e1"}
                  strokeWidth={simState.laserOn && isResonant ? "2.2" : "1"}
                  strokeDasharray="3,3"
                />

                {/* 4. Dark Shortcut from Metastable to Ground */}
                <path
                  d="M 280,48 L 160,72"
                  fill="none"
                  stroke={simState.laserOn && isResonant ? "#f59e0b" : "#cbd5e1"}
                  strokeWidth={simState.laserOn && isResonant ? "1.8" : "1"}
                  strokeDasharray="3,3"
                />
              </svg>

              {/* Animated Electrons Flying */}
              {simState.laserOn && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Laser Pump rising electron dot */}
                  <div 
                    className="absolute w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                    style={{
                      left: '41px',
                      animation: 'jump-up 1.2s infinite linear',
                    }}
                  />

                  {/* Red Glow falling electron dot */}
                  {simState.laserOn && !isResonant && (
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                      style={{
                        left: '121px',
                        animation: 'fall-down 1.4s infinite linear',
                      }}
                    />
                  )}

                  {/* Metastable shortcuts electrons */}
                  {simState.laserOn && isResonant && (
                    <>
                      {/* Flowing to Metastable */}
                      <div 
                        className="absolute w-1.5 h-1.5 rounded-full bg-amber-500"
                        style={{
                          animation: 'meta-forward 1.2s infinite linear',
                        }}
                      />
                      {/* Flowing to Ground */}
                      <div 
                        className="absolute w-1.5 h-1.5 rounded-full bg-amber-600"
                        style={{
                          animation: 'meta-back 1.5s infinite linear',
                        }}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Status helper text right side */}
              <div className="absolute right-[5%] bottom-1 w-[38%] text-[8px] text-slate-500 font-mono text-center leading-normal">
                {!simState.laserOn 
                  ? "Laser off. Electrons sit in ground state."
                  : isResonant
                  ? "Resonance flips spin!"
                  : "Continuous green-in, red-out photoluminescence."}
              </div>

            </div>

            {/* Custom keyframe animation injection */}
            <style>{`
              @keyframes jump-up {
                0% { bottom: 8px; opacity: 0.1; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { bottom: 50px; opacity: 0.1; }
              }
              @keyframes fall-down {
                0% { top: 8px; opacity: 0.1; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { top: 50px; opacity: 0.1; }
              }
              @keyframes meta-forward {
                0% { left: 160px; top: 12px; opacity: 0.1; }
                30% { opacity: 1; }
                70% { opacity: 1; }
                100% { left: 240px; top: 28px; opacity: 0.1; }
              }
              @keyframes meta-back {
                0% { left: 275px; top: 48px; opacity: 0.1; }
                30% { opacity: 1; }
                70% { opacity: 1; }
                100% { left: 160px; top: 72px; opacity: 0.1; }
              }
            `}</style>
          </div>
        </div>

        {/* Right Aspect: The direct sliders */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 border-b border-slate-205 pb-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-700">HARDWARE CONTROLLER</h4>
            </div>

            {/* Firing hardware keys */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-laser-toggle"
                onClick={() => setSimState(prev => ({ ...prev, laserOn: !prev.laserOn }))}
                className={`py-2 px-3 rounded text-[11px] font-bold font-mono flex items-center justify-center gap-1 border transition-all ${
                  simState.laserOn
                    ? 'bg-green-600 hover:bg-green-700 text-white border-transparent font-extrabold shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-250 shadow-xs'
                }`}
              >
                {simState.laserOn ? <Square className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                {simState.laserOn ? 'Kill Laser' : 'Fire Laser'}
              </button>

              <button
                id="btn-microwave-toggle"
                onClick={() => setSimState(prev => ({ ...prev, microwaveOn: !prev.microwaveOn }))}
                className={`py-2 px-3 rounded text-[11px] font-bold font-mono flex items-center justify-center gap-1 border transition-all ${
                  simState.microwaveOn
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-250 shadow-xs'
                }`}
              >
                <Radio className="w-3 h-3" />
                {simState.microwaveOn ? 'Microwaves OFF' : 'Microwaves ON'}
              </button>
            </div>

            {/* Real-time active feedback text */}
            {simState.microwaveOn && (
              <div className={`p-2 rounded text-center text-[10px] font-mono border ${
                isResonant 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {isResonant ? (
                  <span className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    {resonantLabel}
                  </span>
                ) : (
                  '📻 Microwaves active. Tune the Frequency slider to hit a resonance split!'
                )}
              </div>
            )}

            {/* Direct Slider Dials */}
            <div className="space-y-4 pt-2">
              
              {/* Laser intensity */}
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">Laser Brightness</span>
                  <span className="text-green-600 font-bold">{simState.laserPower}%</span>
                </div>
                <input
                  id="slider-laser-power"
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={simState.laserPower}
                  onChange={(e) => setSimState(prev => ({ ...prev, laserPower: Number(e.target.value) }))}
                  className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Microwave frequency resonance sweep */}
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">Microwave Frequency Dial</span>
                  <span className="text-indigo-600 font-bold">{simState.microwaveFrequency.toFixed(3)} GHz</span>
                </div>
                <input
                  id="slider-mw-frequency"
                  type="range"
                  min="2.800"
                  max="2.940"
                  step="0.001"
                  value={simState.microwaveFrequency}
                  onChange={(e) => setSimState(prev => ({ ...prev, microwaveFrequency: Number(e.target.value) }))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Magnetic field split */}
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">Zeeman Magnetic Splitter</span>
                  <span className="text-orange-600 font-bold flex items-center gap-1">
                    <Magnet className="w-3.5 h-3.5 text-orange-500" /> {simState.magneticField.toFixed(1)} mT
                  </span>
                </div>
                <input
                  id="slider-bfield"
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.2"
                  value={simState.magneticField}
                  onChange={(e) => setSimState(prev => ({ ...prev, magneticField: Number(e.target.value) }))}
                  className="w-full accent-orange-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                  {simState.magneticField === 0
                    ? 'No magnetic field is applied. There is a single resonance line at exactly 2.870 GHz.'
                    : `Magnet splits the spin levels. Notice two distinct resonance dips pulling apart!`}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
