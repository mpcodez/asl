export interface ASLTerm {
  id: string;
  word: string;
  definition: string;
  aslDescription: string; // Text description of how to do the sign
  handshapeHint: string; // Visual handshape clue (e.g. "B-handshape", "index finger")
  signVideo: string; // quantum_asl_videos/signs/[term].mp4
  definitionVideo: string; // quantum_asl_videos/definitions/[term] definition.mp4
}

export type SpinState = '0' | '+1' | '-1';

export interface SimState {
  laserPower: number; // 0 to 100
  laserOn: boolean;
  microwaveOn: boolean;
  microwaveFrequency: number; // GHz, e.g. 2.80 to 2.94; resonance at 2.87
  activeEnergyState: 'ground' | 'excited' | 'metastable';
  spinState: SpinState;
  fluorescenceLevel: number; // Dynamic intensity readout
  temperature: number; // Kelvin, e.g. 293 K
  magneticField: number; // Tesla (or Gauss), splits m_s = +1 and m_s = -1 states!
}

export interface ReadoutPoint {
  time: number;
  fluorescence: number;
  laserPulseOn: boolean;
  microwaveOn: boolean;
}

export const ASL_GLOSSARY: Record<string, ASLTerm> = {
  amplitude: {
    id: 'amplitude',
    word: 'Amplitude',
    definition: 'The maximum height of a wave. For microwaves, higher amplitude means a stronger, more intense field pushing the spins.',
    aslDescription: 'Hold both hands flat, horizontally facing each other, then move them apart vertically to show the height of a wave peak and trough.',
    handshapeHint: 'Flat open B-hands moving vertically',
    signVideo: 'quantum_asl_videos/definitions/amplitude_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/amplitude_definition.mp4'
  },
  charge: {
    id: 'charge',
    word: 'Charge',
    definition: 'A basic property of matter. It can be positive or negative. Electrons have a negative charge and carry electric current.',
    aslDescription: 'Form both hands into loose "C" shapes. Tap them together at the knuckles or simulate electric sparks jumping from fingers.',
    handshapeHint: '"C" shape or claw hands tapping',
    signVideo: 'quantum_asl_videos/definitions/charge_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/charge_definition.mp4'
  },
  color_center: {
    id: 'color_center',
    word: 'Color Center',
    definition: 'A point defect in a crystal lattice that absorbs light, making a transparent crystal emit beautiful custom colors.',
    aslDescription: 'Touch index finger of dominant hand to lips (the sign for "color"), then join index and thumbs of both hands into circles, moving them to show a central point (the sign for "center").',
    handshapeHint: '"Color" on lips followed by "Center" location',
    signVideo: 'quantum_asl_videos/definitions/color_center_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/color_center_definition.mp4'
  },
  covalent_bond: {
    id: 'covalent_bond',
    word: 'Covalent Bond',
    definition: 'A strong chemical connection. Atom neighbors share electrons tightly, gluing diamond carbon atoms into a robust crystal structure.',
    aslDescription: 'Interlink fingers of both hands together tightly and move them together, showing the sharing and rigidity of the bond.',
    handshapeHint: 'Interlocking flat fingers',
    signVideo: 'quantum_asl_videos/definitions/covalent_bond_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/covalent_bond_definition.mp4'
  },
  crystal: {
    id: 'crystal',
    word: 'Crystal',
    definition: 'A highly structured solid where atoms are arranged in a neat, geometric, repeating network called a lattice.',
    aslDescription: 'Tap the back of the non-dominant hand with the middle finger of the dominant "V" handshape, then spread both flat hands out showing a clean, geometric surface.',
    handshapeHint: '"V" tapping then flat B-hands',
    signVideo: 'quantum_asl_videos/definitions/crystal_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/crystal_definition.mp4'
  },
  cycle: {
    id: 'cycle',
    word: 'Cycle',
    definition: 'One complete round of a repeating event, like an electron jumping up and down, returning to where it started.',
    aslDescription: 'Use both index fingers or hands to trace a circle in space, showing a repeating circular process that returns to start.',
    handshapeHint: 'Circular tracing motions',
    signVideo: 'quantum_asl_videos/definitions/cycle_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/cycle_definition.mp4'
  },
  defect: {
    id: 'defect',
    word: 'Defect',
    definition: 'A tiny mistake or vacancy in a perfect crystal lattice, which can capture electrons to create a quantum laboratory point.',
    aslDescription: 'Sign "wrong" by tapping "Y" handshape to the chin, then show a point of interruption or space on an otherwise flat hand surface.',
    handshapeHint: '"Y" to chin, then pinpointing a spot',
    signVideo: 'quantum_asl_videos/definitions/defect_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/defect_definition.mp4'
  },
  diamond: {
    id: 'diamond',
    word: 'Diamond',
    definition: 'A beautiful mineral made of tightly bound carbon atoms, providing a silent, hard housing for quantum color centers.',
    aslDescription: 'Point to your ring eye-spot with your dominant index finger and thumb forming a ring shape, or trace a diamond shape in the air using index fingers.',
    handshapeHint: 'Tracing a diamond shape or touching finger ring',
    signVideo: 'quantum_asl_videos/definitions/diamond_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/diamond_definition.mp4'
  },
  difference: {
    id: 'difference',
    word: 'Difference',
    definition: 'The gap between two things, like the space between two resonance dips when a magnetic field splits electron levels.',
    aslDescription: 'Cross both index fingers in an "X" shape, then pull them apart horizontally, indicating separation or divergence.',
    handshapeHint: 'Index fingers crossing then pulling apart',
    signVideo: 'quantum_asl_videos/definitions/difference_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/difference_definition.mp4'
  },
  electromagnetism: {
    id: 'electromagnetism',
    word: 'Electromagnetism',
    definition: 'The natural force combining electricity and magnetism. It governs light fields, electric charges, and radio or microwave signals.',
    aslDescription: 'Interlace fingers of both hands at the knuckles and wiggle them side to side, showing electric charge flow combined with wave motion.',
    handshapeHint: 'Interlocking wiggling fingers',
    signVideo: 'quantum_asl_videos/definitions/electromagnetism_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/electromagnetism_definition.mp4'
  },
  excited_state: {
    id: 'excited_state',
    word: 'Excited State',
    definition: 'A high-energy state. Electrons jump up to this state after absorbing laser light energy.',
    aslDescription: 'Sign "excited" by brushing middle fingers alternately upward on cheeks, then raise both flat hands up high to indicate higher level.',
    handshapeHint: 'Middle fingers brushing chest/cheeks up, then raising level',
    signVideo: 'quantum_asl_videos/definitions/excited_state_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/excited_state_definition.mp4'
  },
  frequency: {
    id: 'frequency',
    word: 'Frequency',
    definition: 'How fast a wave repeats, counted in cycles per second. Hertz (Hz) means counts per second. GHz means billions of counts per second.',
    aslDescription: 'Tap the index finger of the dominant hand repeatedly across the open palm of the non-dominant hand, indicating recurring fast counts.',
    handshapeHint: 'Tapping index across flat hand',
    signVideo: 'quantum_asl_videos/definitions/frequency_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/frequency_definition.mp4'
  },
  ground_state: {
    id: 'ground_state',
    word: 'Ground State',
    definition: 'The lowest energy state of an atom. Electrons rest quietly here before a laser excites them.',
    aslDescription: 'Position both hands flat horizontally, then lower them close to the table, indicating base, earth, or the lowest energy plane.',
    handshapeHint: 'Flat horizontal hands pushed low',
    signVideo: 'quantum_asl_videos/definitions/ground_state_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/ground_state_definition.mp4'
  },
  laser: {
    id: 'laser',
    word: 'Laser',
    definition: 'A device that shoots a very narrow, single-color, high-energy beam of light. Green lasers are used to pump optical defects.',
    aslDescription: 'Extend index finger of dominant hand to act as pointer, then quickly shoot it forward from the other hand to represent a narrow beam of light.',
    handshapeHint: 'Index finger shooting beam forward',
    signVideo: 'quantum_asl_videos/definitions/laser_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/laser_definition.mp4'
  },
  photoluminescence: {
    id: 'photoluminescence',
    word: 'Photoluminescence',
    definition: 'Light emitted by a material after absorbing previous light. Green light absorption leading to red light output is photoluminescence.',
    aslDescription: 'Sign "light" with flicking middle finger at chin, then open both palms outward repeatedly to show bright glowing bursts.',
    handshapeHint: '"Light" flick followed by blooming fingers',
    signVideo: 'quantum_asl_videos/definitions/photoluminescence_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/photoluminescence_definition.mp4'
  },
  sinusoidal: {
    id: 'sinusoidal',
    word: 'Sinusoidal',
    definition: 'A smooth, repeating S-curve wave shape, like a microwave field or electric signals.',
    aslDescription: 'Sweep hand forward horizontally while drawing a smooth, repeating S-curve wave in the air.',
    handshapeHint: 'Smooth horizontal wave motion',
    signVideo: 'quantum_asl_videos/definitions/sinusoidal_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/sinusoidal_definition.mp4'
  },
  spin_quantum: {
    id: 'spin_quantum',
    word: 'Quantum Spin',
    definition: 'An tiny, built-in magnet-like spin pointing up, down, or sideways. It makes electrons act like microscopic compass needles.',
    aslDescription: 'Hold index finger vertically as a tiny axis. Orbit the index finger of the other hand around it, then trace an arrow spinning on its head.',
    handshapeHint: 'Spinning finger around vertical axis',
    signVideo: 'quantum_asl_videos/definitions/spin_quantum_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/spin_quantum_definition.mp4'
  },
  wavelength: {
    id: 'wavelength',
    word: 'Wavelength',
    definition: 'The width of a single repeating wave cycle. Green light has a 532 nm wavelength; red light has a longer 637 nm wavelength.',
    aslDescription: 'Move both hands flat horizontally side by side in wave shapes, then pull them apart horizontally to define the length of a single peak.',
    handshapeHint: 'Wavy hand shape, then widening horizontal gap',
    signVideo: 'quantum_asl_videos/definitions/wavelength_definition.mp4',
    definitionVideo: 'quantum_asl_videos/definitions/wavelength_definition.mp4'
  }
};
