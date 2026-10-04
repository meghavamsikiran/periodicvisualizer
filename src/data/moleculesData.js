export const PRESET_MOLECULES = [
  {
    id: "h2o",
    name: "Water",
    formula: "H₂O",
    molecularMass: "18.015 g/mol",
    requiredElements: { "H": 2, "O": 1 },
    bondType: "Polar Covalent",
    shape: "Bent Geometry",
    bondAngle: "104.5°",
    dipole: "1.85 Debye (Polar)",
    color: "#00f0ff",
    description: "Universal solvent essential for all known biological life and cellular processes.",
    classNote: "Oxygen atom shares single covalent bonds with 2 Hydrogen atoms. High electronegativity of Oxygen creates a strong polar dipole moment.",
    uses: ["Biological Hydration", "Industrial Coolant", "Universal Solvent"],
    atoms: [
      { symbol: "O", name: "Oxygen", position: [0, 0.2, 0], color: "#ef4444", radius: 0.7, vdwRadius: 1.0, valency: 2 },
      { symbol: "H", name: "Hydrogen", position: [-1.25, -0.65, 0], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [1.25, -0.65, 0], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single" },
      { from: 0, to: 2, type: "single" }
    ]
  },
  {
    id: "h2o2",
    name: "Hydrogen Peroxide",
    formula: "H₂O₂",
    molecularMass: "34.014 g/mol",
    requiredElements: { "H": 2, "O": 2 },
    bondType: "Covalent Peroxide Bond",
    shape: "Non-planar Open Book",
    bondAngle: "101.9°",
    dipole: "2.26 Debye",
    color: "#38bdf8",
    description: "Pale blue liquid sanitizer and powerful oxidizing agent.",
    classNote: "Contains a single Oxygen-Oxygen covalent peroxide bond (H-O-O-H). Strong oxidizing agent.",
    uses: ["Antiseptic Disinfectant", "Bleaching Agent", "Rocket Monopropellant"],
    atoms: [
      { symbol: "O", name: "Oxygen", position: [-0.75, 0.2, 0], color: "#ef4444", radius: 0.68, vdwRadius: 1.0, valency: 2 },
      { symbol: "O", name: "Oxygen", position: [0.75, 0.2, 0], color: "#ef4444", radius: 0.68, vdwRadius: 1.0, valency: 2 },
      { symbol: "H", name: "Hydrogen", position: [-1.65, -0.55, 0.4], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [1.65, -0.55, -0.4], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single" },
      { from: 0, to: 2, type: "single" },
      { from: 1, to: 3, type: "single" }
    ]
  },
  {
    id: "co2",
    name: "Carbon Dioxide",
    formula: "CO₂",
    molecularMass: "44.01 g/mol",
    requiredElements: { "C": 1, "O": 2 },
    bondType: "Double Covalent",
    shape: "Linear",
    bondAngle: "180.0°",
    dipole: "0 Debye (Non-polar)",
    color: "#a855f7",
    description: "Greenhouse gas produced by cellular respiration, fermentation, and fossil combustion.",
    classNote: "Central Carbon atom forms double covalent bonds with each Oxygen atom (O=C=O). Equal linear opposing dipoles cancel out.",
    uses: ["Photosynthesis in Plants", "Fire Extinguishers", "Carbonated Beverages"],
    atoms: [
      { symbol: "C", name: "Carbon", position: [0, 0, 0], color: "#334155", radius: 0.65, vdwRadius: 0.95, valency: 4 },
      { symbol: "O", name: "Oxygen", position: [-1.65, 0, 0], color: "#ef4444", radius: 0.7, vdwRadius: 1.0, valency: 2 },
      { symbol: "O", name: "Oxygen", position: [1.65, 0, 0], color: "#ef4444", radius: 0.7, vdwRadius: 1.0, valency: 2 },
    ],
    bonds: [
      { from: 0, to: 1, type: "double" },
      { from: 0, to: 2, type: "double" }
    ]
  },
  {
    id: "nacl",
    name: "Sodium Chloride",
    formula: "NaCl",
    molecularMass: "58.44 g/mol",
    requiredElements: { "Na": 1, "Cl": 1 },
    bondType: "Ionic Bond",
    shape: "Linear Crystal Pair",
    bondAngle: "180.0°",
    dipole: "9.0 Debye (Highly Ionic)",
    color: "#10b981",
    description: "Common table salt formed by complete electron transfer from Sodium to Chlorine.",
    classNote: "Sodium (Na) loses 1 electron to form Na⁺ cation, while Chlorine (Cl) gains 1 electron to form Cl⁻ anion in a strong electrostatic ionic lattice.",
    uses: ["Food Seasoning & Preservation", "De-icing Roads", "Chemical Synthesis"],
    atoms: [
      { symbol: "Na", name: "Sodium Ion (Na⁺)", position: [-1.2, 0, 0], color: "#f97316", radius: 0.75, vdwRadius: 1.1, valency: 1 },
      { symbol: "Cl", name: "Chloride Ion (Cl⁻)", position: [1.2, 0, 0], color: "#10b981", radius: 0.85, vdwRadius: 1.25, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic" }
    ]
  },
  {
    id: "ch4",
    name: "Methane",
    formula: "CH₄",
    molecularMass: "16.04 g/mol",
    requiredElements: { "C": 1, "H": 4 },
    bondType: "Non-polar Covalent",
    shape: "Tetrahedral",
    bondAngle: "109.5°",
    dipole: "0 Debye",
    color: "#eab308",
    description: "Primary component of natural gas; simplest alkane hydrocarbon compound.",
    classNote: "Central Carbon shares 4 single covalent bonds with Hydrogen atoms directed toward the vertices of a regular tetrahedron.",
    uses: ["Natural Gas Energy Fuel", "Hydrogen Fuel Production", "Industrial Heat"],
    atoms: [
      { symbol: "C", name: "Carbon", position: [0, 0, 0], color: "#334155", radius: 0.65, vdwRadius: 0.95, valency: 4 },
      { symbol: "H", name: "Hydrogen", position: [0, 1.3, 0], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [1.2, -0.4, 0.7], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [-1.2, -0.4, 0.7], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [0, -0.4, -1.3], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single" },
      { from: 0, to: 2, type: "single" },
      { from: 0, to: 3, type: "single" },
      { from: 0, to: 4, type: "single" }
    ]
  },
  {
    id: "nh3",
    name: "Ammonia",
    formula: "NH₃",
    molecularMass: "17.03 g/mol",
    requiredElements: { "N": 1, "H": 3 },
    bondType: "Covalent with Lone Pair",
    shape: "Trigonal Pyramidal",
    bondAngle: "107.8°",
    dipole: "1.42 Debye",
    color: "#3b82f6",
    description: "Pungent gas essential for manufacturing nitrogen agricultural fertilizers.",
    classNote: "Nitrogen forms 3 single covalent bonds with Hydrogen atoms and retains 1 lone pair of electrons causing pyramidal repulsion.",
    uses: ["Agricultural Fertilizers", "Industrial Refrigerant", "Cleaning Products"],
    atoms: [
      { symbol: "N", name: "Nitrogen", position: [0, 0.35, 0], color: "#2563eb", radius: 0.65, vdwRadius: 0.95, valency: 3 },
      { symbol: "H", name: "Hydrogen", position: [0, -0.65, 1.15], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [1.05, -0.65, -0.55], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [-1.05, -0.65, -0.55], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single" },
      { from: 0, to: 2, type: "single" },
      { from: 0, to: 3, type: "single" }
    ]
  },
  {
    id: "hcl",
    name: "Hydrochloric Acid",
    formula: "HCl",
    molecularMass: "36.46 g/mol",
    requiredElements: { "H": 1, "Cl": 1 },
    bondType: "Polar Covalent",
    shape: "Linear",
    bondAngle: "180.0°",
    dipole: "1.08 Debye",
    color: "#ec4899",
    description: "Strong mineral acid present naturally in human stomach gastric juices.",
    classNote: "Hydrogen shares 1 electron pair with Chlorine. High electronegativity of Chlorine creates polar charge separation.",
    uses: ["Stomach Digestion Acid", "Steel Pickling", "Chemical Synthesis"],
    atoms: [
      { symbol: "H", name: "Hydrogen", position: [-1.0, 0, 0], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 },
      { symbol: "Cl", name: "Chlorine", position: [1.0, 0, 0], color: "#10b981", radius: 0.8, vdwRadius: 1.2, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single" }
    ]
  },
  {
    id: "o2",
    name: "Oxygen Gas",
    formula: "O₂",
    molecularMass: "31.999 g/mol",
    requiredElements: { "O": 2 },
    bondType: "Double Covalent",
    shape: "Diatomic Linear",
    bondAngle: "180.0°",
    dipole: "0 Debye",
    color: "#ef4444",
    description: "Life-sustaining gas forming 21% of Earth's atmosphere.",
    classNote: "Two Oxygen atoms share 2 pairs of valence electrons to form a strong double covalent bond (O=O).",
    uses: ["Human Respiration", "Medical Oxygen", "Steelmaking"],
    atoms: [
      { symbol: "O", name: "Oxygen", position: [-0.95, 0, 0], color: "#ef4444", radius: 0.68, vdwRadius: 1.0, valency: 2 },
      { symbol: "O", name: "Oxygen", position: [0.95, 0, 0], color: "#ef4444", radius: 0.68, vdwRadius: 1.0, valency: 2 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double" }
    ]
  },
  {
    id: "h2",
    name: "Hydrogen Gas",
    formula: "H₂",
    molecularMass: "2.016 g/mol",
    requiredElements: { "H": 2 },
    bondType: "Single Covalent",
    shape: "Diatomic Linear",
    bondAngle: "180.0°",
    dipole: "0 Debye",
    color: "#38bdf8",
    description: "Smallest, lightest diatomic chemical gas molecule.",
    classNote: "Two Hydrogen atoms share 1 electron pair to complete their duplet shell configuration.",
    uses: ["Rocket Fuel", "Clean Hydrogen Energy", "Ammonia Synthesis"],
    atoms: [
      { symbol: "H", name: "Hydrogen", position: [-0.75, 0, 0], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 },
      { symbol: "H", name: "Hydrogen", position: [0.75, 0, 0], color: "#f8fafc", radius: 0.45, vdwRadius: 0.7, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single" }
    ]
  },
  {
    id: "mgo",
    name: "Magnesium Oxide",
    formula: "MgO",
    molecularMass: "40.30 g/mol",
    requiredElements: { "Mg": 1, "O": 1 },
    bondType: "Ionic Bond",
    shape: "Linear Crystal Pair",
    bondAngle: "180.0°",
    dipole: "6.2 Debye",
    color: "#f97316",
    description: "White hygroscopic solid mineral formed when Magnesium burns in air.",
    classNote: "Magnesium transfers 2 valence electrons to Oxygen forming Mg²⁺ and O²⁻ ions in a high-melting-point ionic lattice.",
    uses: ["Refractory Furnace Lining", "Antacid Medicines", "Electrical Insulation"],
    atoms: [
      { symbol: "Mg", name: "Magnesium Ion (Mg²⁺)", position: [-1.1, 0, 0], color: "#f97316", radius: 0.75, vdwRadius: 1.1, valency: 2 },
      { symbol: "O", name: "Oxide Ion (O²⁻)", position: [1.1, 0, 0], color: "#ef4444", radius: 0.7, vdwRadius: 1.0, valency: 2 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic" }
    ]
  },
  {
    id: "naoh",
    name: "Sodium Hydroxide (Caustic Soda)",
    formula: "NaOH",
    molecularMass: "39.997 g/mol",
    requiredElements: { "Na": 1, "O": 1, "H": 1 },
    bondType: "Ionic & Covalent",
    shape: "Linear Chain",
    bondAngle: "180.0°",
    dipole: "7.1 Debye",
    color: "#00ff88",
    description: "Strong alkali base used in soap manufacturing and drain cleaners.",
    classNote: "Ionic bond between Na⁺ and OH⁻ hydroxide ion, with a covalent single bond between O and H.",
    uses: ["Soap & Detergent Making", "Drain Cleaners", "Paper Production"],
    atoms: [
      { symbol: "Na", name: "Sodium Ion (Na⁺)", position: [-1.4, 0, 0], color: "#f97316", radius: 0.75, vdwRadius: 1.1, valency: 1 },
      { symbol: "O", name: "Oxygen", position: [0.3, 0, 0], color: "#ef4444", radius: 0.68, vdwRadius: 1.0, valency: 2 },
      { symbol: "H", name: "Hydrogen", position: [1.4, 0, 0], color: "#f8fafc", radius: 0.42, vdwRadius: 0.7, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic" },
      { from: 1, to: 2, type: "single" }
    ]
  },
  {
    id: "caco3",
    name: "Calcium Carbonate",
    formula: "CaCO₃",
    molecularMass: "100.09 g/mol",
    requiredElements: { "Ca": 1, "C": 1, "O": 3 },
    bondType: "Ionic & Covalent",
    shape: "Trigonal Planar Carbonate with Ca²⁺",
    bondAngle: "120.0°",
    dipole: "Ionic Lattice",
    color: "#f59e0b",
    description: "Main component of chalk, limestone, marble, and sea creature shells.",
    classNote: "Trigonal planar carbonate anion (CO₃²⁻) with 120° O-C-O bond angles bound ionically to a Calcium cation (Ca²⁺).",
    uses: ["Building Limestone & Marble", "Antacid Supplement", "Cement Production"],
    atoms: [
      { symbol: "C", name: "Carbon Core", position: [0, 0, 0], color: "#334155", radius: 0.60, vdwRadius: 0.9, valency: 4 },
      { symbol: "O", name: "Oxygen 1", position: [0, 1.25, 0], color: "#ef4444", radius: 0.65, vdwRadius: 0.95, valency: 2 },
      { symbol: "O", name: "Oxygen 2", position: [1.08, -0.62, 0], color: "#ef4444", radius: 0.65, vdwRadius: 0.95, valency: 2 },
      { symbol: "O", name: "Oxygen 3", position: [-1.08, -0.62, 0], color: "#ef4444", radius: 0.65, vdwRadius: 0.95, valency: 2 },
      { symbol: "Ca", name: "Calcium Ion (Ca²⁺)", position: [0, 0, 1.35], color: "#f59e0b", radius: 0.80, vdwRadius: 1.15, valency: 2 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double" },
      { from: 0, to: 2, type: "single" },
      { from: 0, to: 3, type: "single" },
      { from: 0, to: 4, type: "ionic" }
    ]
  },
  {
    id: "h2so4",
    name: "Sulfuric Acid",
    formula: "H₂SO₄",
    molecularMass: "98.079 g/mol",
    requiredElements: { "H": 2, "S": 1, "O": 4 },
    bondType: "Covalent Dipolar",
    shape: "Tetrahedral Core",
    bondAngle: "109.5°",
    dipole: "2.7 Debye",
    color: "#eab308",
    description: "Highly corrosive mineral acid essential in chemical industrial manufacturing.",
    classNote: "Central Sulfur atom bonded to 2 double-bonded Oxides and 2 Hydroxide groups in a tetrahedral geometry.",
    uses: ["Lead-Acid Car Batteries", "Fertilizer Manufacturing", "Chemical Refining"],
    atoms: [
      { symbol: "S", name: "Sulfur Core", position: [0, 0, 0], color: "#eab308", radius: 0.70, vdwRadius: 1.0, valency: 6 },
      { symbol: "O", name: "Oxo-Oxygen 1", position: [0, 1.3, 0], color: "#ef4444", radius: 0.62, vdwRadius: 0.9, valency: 2 },
      { symbol: "O", name: "Oxo-Oxygen 2", position: [1.2, -0.4, 0.5], color: "#ef4444", radius: 0.62, vdwRadius: 0.9, valency: 2 },
      { symbol: "O", name: "Hydroxyl Oxygen 1", position: [-1.2, -0.4, 0.5], color: "#ef4444", radius: 0.62, vdwRadius: 0.9, valency: 2 },
      { symbol: "O", name: "Hydroxyl Oxygen 2", position: [0, -0.4, -1.3], color: "#ef4444", radius: 0.62, vdwRadius: 0.9, valency: 2 },
      { symbol: "H", name: "Hydrogen 1", position: [-1.8, -0.9, 0.7], color: "#f8fafc", radius: 0.40, vdwRadius: 0.65, valency: 1 },
      { symbol: "H", name: "Hydrogen 2", position: [0.6, -0.9, -1.8], color: "#f8fafc", radius: 0.40, vdwRadius: 0.65, valency: 1 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double" },
      { from: 0, to: 2, type: "double" },
      { from: 0, to: 3, type: "single" },
      { from: 0, to: 4, type: "single" },
      { from: 3, to: 5, type: "single" },
      { from: 4, to: 6, type: "single" }
    ]
  },
  {
    id: "c17h35coona",
    name: "Soap (Sodium Stearate)",
    formula: "C₁₇H₃₅COONa",
    molecularMass: "306.46 g/mol",
    requiredElements: { "C": 18, "H": 35, "O": 2, "Na": 1 },
    bondType: "Amphiphilic Soap Molecule",
    shape: "Hydrophobic Tail + Polar Head",
    bondAngle: "109.5° Chain",
    dipole: "Ionic Head / Nonpolar Tail",
    color: "#06b6d4",
    description: "Classic bar soap molecule with long nonpolar grease-dissolving hydrocarbon tail and water-soluble ionic head.",
    classNote: "Long 18-carbon hydrophobic lipophilic chain traps oils, while the ionic COO⁻Na⁺ hydrophilic head dissolves in water.",
    uses: ["Personal Hygiene Soap", "Emulsifier in Cosmetics", "Industrial Lubricant"],
    atoms: (() => {
      const list = [];
      // Compact spiral 3D chain for 18 carbons
      for (let i = 0; i < 18; i++) {
        const angle = i * 0.45;
        const x = (i - 8.5) * 0.28;
        const y = Math.sin(angle) * 0.4;
        const z = Math.cos(angle) * 0.3;
        list.push({ symbol: "C", name: `Carbon ${i+1}`, position: [x, y, z], color: "#334155", radius: 0.35, vdwRadius: 0.6, valency: 4 });
      }
      // Add Hydrogens along chain
      for (let i = 0; i < 35; i++) {
        const cIdx = i % 18;
        const cPos = list[cIdx].position;
        const hAngle = i * 0.8;
        list.push({ symbol: "H", name: `Hydrogen ${i+1}`, position: [cPos[0] + Math.sin(hAngle)*0.35, cPos[1] + Math.cos(hAngle)*0.35, cPos[2] + (i%2===0?0.35:-0.35)], color: "#f8fafc", radius: 0.20, vdwRadius: 0.35, valency: 1 });
      }
      // Add COO- Na+ head
      const headPos = list[17].position;
      list.push({ symbol: "O", name: "Carboxylate Oxygen 1", position: [headPos[0] + 0.6, headPos[1] + 0.4, headPos[2]], color: "#ef4444", radius: 0.38, vdwRadius: 0.6, valency: 2 });
      list.push({ symbol: "O", name: "Carboxylate Oxygen 2", position: [headPos[0] + 0.6, headPos[1] - 0.4, headPos[2]], color: "#ef4444", radius: 0.38, vdwRadius: 0.6, valency: 2 });
      list.push({ symbol: "Na", name: "Sodium Cation (Na⁺)", position: [headPos[0] + 1.2, headPos[1], headPos[2]], color: "#f97316", radius: 0.45, vdwRadius: 0.7, valency: 1 });
      return list;
    })(),
    bonds: (() => {
      const b = [];
      for (let i = 0; i < 17; i++) {
        b.push({ from: i, to: i + 1, type: "single" });
      }
      // Hydrogens to carbons
      for (let i = 0; i < 35; i++) {
        b.push({ from: i % 18, to: 18 + i, type: "single" });
      }
      // Carboxylate head
      b.push({ from: 17, to: 53, type: "double" });
      b.push({ from: 17, to: 54, type: "single" });
      b.push({ from: 54, to: 55, type: "ionic" });
      return b;
    })()
  }
];

import { ELEMENTS } from './periodicData';

/**
 * Dynamically constructs a 3D Pure Elemental Structure/Lattice for ANY of the 118 periodic elements.
 */
export function createPureElementMolecule(symbol) {
  if (!symbol || symbol === 'all') return null;
  const elem = ELEMENTS.find((e) => e.symbol.toUpperCase() === symbol.toUpperCase());
  if (!elem) return null;

  const colorMap = {
    'alkali-metal': '#f97316',
    'alkaline-earth': '#f59e0b',
    'transition-metal': elem.symbol === 'Au' ? '#ffd700' : elem.symbol === 'Cu' ? '#b45309' : elem.symbol === 'Ag' ? '#e2e8f0' : '#3b82f6',
    'post-transition': '#a855f7',
    'metalloid': '#eab308',
    'reactive-nonmetal': '#10b981',
    'halogen': '#ec4899',
    'noble-gas': '#06b6d4',
    'lanthanide': '#38bdf8',
    'actinide': elem.symbol === 'U' ? '#22c55e' : '#2dd4bf'
  };

  const elemColor = colorMap[elem.category] || '#00f0ff';
  const isGas = elem.state === 'gas';

  let atoms = [];
  let bonds = [];

  if (isGas && elem.category === 'noble-gas') {
    // Single glowing noble gas atom with orbiting electron shell positions
    atoms = [
      { symbol: elem.symbol, name: `${elem.name} Core Atom`, position: [0, 0, 0], color: elemColor, radius: 0.85, vdwRadius: 1.3, valency: 0 }
    ];
  } else if (isGas || elem.category === 'halogen') {
    // Diatomic gas molecule (e.g., F2, Cl2, N2, Br2)
    atoms = [
      { symbol: elem.symbol, name: `${elem.name} Atom 1`, position: [-0.9, 0, 0], color: elemColor, radius: 0.7, vdwRadius: 1.05, valency: elem.valency },
      { symbol: elem.symbol, name: `${elem.name} Atom 2`, position: [0.9, 0, 0], color: elemColor, radius: 0.7, vdwRadius: 1.05, valency: elem.valency }
    ];
    bonds = [{ from: 0, to: 1, type: elem.valency >= 2 ? 'double' : 'single' }];
  } else {
    // Metallic or Crystal unit cell cluster (5-atom lattice unit with clean spacing)
    atoms = [
      { symbol: elem.symbol, name: `Central ${elem.name} Atom`, position: [0, 0, 0], color: elemColor, radius: 0.68, vdwRadius: 1.0, valency: elem.valency },
      { symbol: elem.symbol, name: `Lattice Corner 1`, position: [1.35, 1.35, 0], color: elemColor, radius: 0.50, vdwRadius: 0.8, valency: elem.valency },
      { symbol: elem.symbol, name: `Lattice Corner 2`, position: [-1.35, 1.35, 0], color: elemColor, radius: 0.50, vdwRadius: 0.8, valency: elem.valency },
      { symbol: elem.symbol, name: `Lattice Corner 3`, position: [1.35, -1.35, 0], color: elemColor, radius: 0.50, vdwRadius: 0.8, valency: elem.valency },
      { symbol: elem.symbol, name: `Lattice Corner 4`, position: [-1.35, -1.35, 0], color: elemColor, radius: 0.50, vdwRadius: 0.8, valency: elem.valency },
    ];
    bonds = [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 0, to: 4, type: 'single' }
    ];
  }

  return {
    id: `elem_${elem.symbol.toLowerCase()}`,
    name: `${elem.name} (Pure Element)`,
    formula: elem.symbol,
    molecularMass: `${elem.mass} g/mol`,
    requiredElements: { [elem.symbol]: 1 },
    bondType: isGas ? (elem.category === 'noble-gas' ? 'Monoatomic Gas' : 'Diatomic Covalent') : 'Metallic / Covalent Lattice',
    shape: isGas ? 'Gas Orbit' : 'Crystal Unit Cell',
    bondAngle: 'N/A (Pure Element)',
    dipole: '0 Debye (Non-polar)',
    color: elemColor,
    description: elem.summary,
    classNote: `Pure elemental ${elem.name} (Z = ${elem.number}, Period ${elem.period}, Group ${elem.group}). Shell configuration: [${elem.shells.join(', ')}].`,
    uses: elem.uses || ['Scientific Research', 'Industrial Material'],
    atoms,
    bonds
  };
}

/**
 * Returns filtered preset molecules AND dynamic pure element model for ANY selected element.
 */
export function getFilteredMolecules(selectedSymbol) {
  if (!selectedSymbol || selectedSymbol === 'all') {
    return PRESET_MOLECULES;
  }

  const matchingPresets = PRESET_MOLECULES.filter((mol) => {
    return mol.requiredElements && mol.requiredElements[selectedSymbol] !== undefined;
  });

  const pureElement = createPureElementMolecule(selectedSymbol);

  if (pureElement) {
    // Check if pure element already exists in matching presets (e.g. H2, O2)
    const exists = matchingPresets.some(
      (m) => m.formula.toLowerCase() === selectedSymbol.toLowerCase() || m.id === pureElement.id
    );
    if (!exists) {
      return [pureElement, ...matchingPresets];
    }
  }

  return matchingPresets.length > 0 ? matchingPresets : pureElement ? [pureElement] : PRESET_MOLECULES;
}

