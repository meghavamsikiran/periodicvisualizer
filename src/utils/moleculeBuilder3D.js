import * as THREE from 'three';
import { ELEMENTS } from '../data/periodicData';

// Standard CPK Chemistry Color Map for instant scientific recognition
export const CPK_ATOM_COLORS = {
  H: { color: '#f8fafc', emissive: '#cbd5e1', radius: 0.24 },   // Hydrogen: White
  C: { color: '#334155', emissive: '#1e293b', radius: 0.38 },   // Carbon: Dark Charcoal
  N: { color: '#3b82f6', emissive: '#1d4ed8', radius: 0.36 },   // Nitrogen: Deep Blue
  O: { color: '#ef4444', emissive: '#b91c1c', radius: 0.35 },   // Oxygen: Vivid Red
  F: { color: '#06b6d4', emissive: '#0e7490', radius: 0.32 },   // Fluorine: Cyan
  Na: { color: '#f97316', emissive: '#c2410c', radius: 0.45 },  // Sodium: Bright Orange
  Mg: { color: '#eab308', emissive: '#a16207', radius: 0.42 },  // Magnesium: Gold Yellow
  Al: { color: '#94a3b8', emissive: '#475569', radius: 0.40 },  // Aluminum: Silver Gray
  Si: { color: '#14b8a6', emissive: '#0f766e', radius: 0.40 },  // Silicon: Teal
  P: { color: '#f97316', emissive: '#ea580c', radius: 0.38 },   // Phosphorus: Orange
  S: { color: '#eab308', emissive: '#ca8a04', radius: 0.38 },   // Sulfur: Yellow
  Cl: { color: '#10b981', emissive: '#047857', radius: 0.38 },  // Chlorine: Emerald Green
  K: { color: '#a855f7', emissive: '#7e22ce', radius: 0.48 },   // Potassium: Purple
  Ca: { color: '#f59e0b', emissive: '#b45309', radius: 0.46 },  // Calcium: Amber
  Fe: { color: '#cbd5e1', emissive: '#64748b', radius: 0.42 },  // Iron: Steel Silver
  Cu: { color: '#b45309', emissive: '#78350f', radius: 0.40 },  // Copper: Bronze
  Zn: { color: '#64748b', emissive: '#334155', radius: 0.40 },  // Zinc: Slate
  Au: { color: '#ffd700', emissive: '#b45309', radius: 0.45 },  // Gold: Golden
  Ag: { color: '#e2e8f0', emissive: '#94a3b8', radius: 0.43 },  // Silver: Silver
  Pb: { color: '#475569', emissive: '#1e293b', radius: 0.44 },  // Lead: Dark Gray
  U: { color: '#22c55e', emissive: '#15803d', radius: 0.50 }   // Uranium: Glowing Green
};

/**
 * Intelligent 3D Chemical Structure Generator
 * Constructs clean, non-overlapping 3D molecular structures (zig-zag hydrocarbon chains, 3D functional groups, CPK colors).
 */
export function generate3DSpatialMolecule(symbolsList) {
  const total = symbolsList.length;
  if (total === 0) return { atoms: [], bonds: [] };

  // Separate atoms into Backbones (C, Si, N), Hydrogens (H), and Functional/Halogen groups (O, Na, Cl, etc.)
  const carbons = [];
  const hydrogens = [];
  const others = [];

  symbolsList.forEach((sym, idx) => {
    const item = { symbol: sym, originalIdx: idx };
    if (sym === 'C') carbons.push(item);
    else if (sym === 'H') hydrogens.push(item);
    else others.push(item);
  });

  const atoms = new Array(total);
  const bonds = [];

  // Helper to get CPK styling for any element
  const getAtomStyle = (sym) => {
    const cpk = CPK_ATOM_COLORS[sym];
    if (cpk) return cpk;
    const elemObj = ELEMENTS.find(e => e.symbol === sym) || {};
    return { color: '#00f0ff', emissive: '#005f66', radius: 0.35 };
  };

  // Case 1: Complex Organic / Hydrocarbon Chain (e.g. C17H35COONa, C6H12O6, CH4, C2H6)
  if (carbons.length > 0) {
    const numC = carbons.length;
    const cSpacing = 0.95; // Spacing between backbone carbons
    const startX = -((numC - 1) * cSpacing) / 2;

    // 1. Position Carbon Backbone in a 3D Zig-Zag chain
    const carbonPositions = [];
    carbons.forEach((cItem, i) => {
      const x = startX + i * cSpacing;
      const y = (i % 2 === 0 ? 0.3 : -0.3);
      const z = Math.sin(i * 0.5) * 0.2;
      const pos = [x, y, z];
      carbonPositions.push(pos);

      const style = getAtomStyle('C');
      const elemObj = ELEMENTS.find(e => e.symbol === 'C') || {};

      atoms[cItem.originalIdx] = {
        index: cItem.originalIdx,
        symbol: 'C',
        name: 'Carbon',
        number: 6,
        category: 'reactive-nonmetal',
        color: style.color,
        emissive: style.emissive,
        position: pos,
        radius: style.radius
      };

      // Connect adjacent Carbon backbone atoms
      if (i > 0) {
        bonds.push({ from: carbons[i - 1].originalIdx, to: cItem.originalIdx, type: 'single' });
      }
    });

    // 2. Attach Hydrogens symmetrically along the Carbon chain
    let hIdx = 0;
    const hPerC = Math.floor(hydrogens.length / numC);
    let hRem = hydrogens.length % numC;

    carbons.forEach((cItem, i) => {
      const cPos = carbonPositions[i];
      let countForThisC = hPerC + (hRem > 0 ? 1 : 0);
      if (hRem > 0) hRem--;

      // Symmetrically orient attached Hydrogens perpendicular to the chain axis
      for (let k = 0; k < countForThisC && hIdx < hydrogens.length; k++) {
        const hItem = hydrogens[hIdx++];
        const angle = (k / countForThisC) * Math.PI * 2 + (i % 2 === 0 ? 0 : Math.PI / 4);
        const dist = 0.75;

        const hX = cPos[0] + Math.cos(angle) * 0.35;
        const hY = cPos[1] + Math.sin(angle) * dist;
        const hZ = cPos[2] + Math.cos(angle * 2) * dist;
        const pos = [hX, hY, hZ];

        const style = getAtomStyle('H');
        atoms[hItem.originalIdx] = {
          index: hItem.originalIdx,
          symbol: 'H',
          name: 'Hydrogen',
          number: 1,
          category: 'reactive-nonmetal',
          color: style.color,
          emissive: style.emissive,
          position: pos,
          radius: style.radius
        };

        bonds.push({ from: cItem.originalIdx, to: hItem.originalIdx, type: 'single' });
      }
    });

    // Attach any remaining unassigned Hydrogens
    while (hIdx < hydrogens.length) {
      const hItem = hydrogens[hIdx++];
      const cItem = carbons[hIdx % numC];
      const cPos = carbonPositions[hIdx % numC];
      const pos = [cPos[0], cPos[1] + 0.8, cPos[2] + (hIdx % 2 === 0 ? 0.6 : -0.6)];
      const style = getAtomStyle('H');

      atoms[hItem.originalIdx] = {
        index: hItem.originalIdx,
        symbol: 'H',
        name: 'Hydrogen',
        number: 1,
        category: 'reactive-nonmetal',
        color: style.color,
        emissive: style.emissive,
        position: pos,
        radius: style.radius
      };
      bonds.push({ from: cItem.originalIdx, to: hItem.originalIdx, type: 'single' });
    }

    // 3. Attach Functional / Hetero groups (O, Na, N, S, Cl) at the head of the chain
    const lastCPos = carbonPositions[numC - 1] || [0, 0, 0];
    const lastCIdx = carbons[numC - 1].originalIdx;

    others.forEach((oItem, i) => {
      const angle = (i / Math.max(1, others.length)) * Math.PI * 1.5 - Math.PI / 4;
      const dist = 0.9 + i * 0.4;
      const pos = [lastCPos[0] + Math.cos(angle) * dist + 0.8, lastCPos[1] + Math.sin(angle) * dist, lastCPos[2] + (i % 2 === 0 ? 0.3 : -0.3)];

      const style = getAtomStyle(oItem.symbol);
      const elemObj = ELEMENTS.find(e => e.symbol === oItem.symbol) || {};

      atoms[oItem.originalIdx] = {
        index: oItem.originalIdx,
        symbol: oItem.symbol,
        name: elemObj.name || oItem.symbol,
        number: elemObj.number || 1,
        category: elemObj.category || 'reactive-nonmetal',
        color: style.color,
        emissive: style.emissive,
        position: pos,
        radius: style.radius
      };

      // Connect to the terminal Carbon or previous hetero atom
      const connectTo = i === 0 ? lastCIdx : others[i - 1].originalIdx;
      bonds.push({ from: connectTo, to: oItem.originalIdx, type: oItem.symbol === 'O' && i === 0 ? 'double' : 'single' });
    });

  } else {
    // Case 2: General Non-Organic Molecules / Inorganic Crystals (e.g. H2O, NaCl, NH3, MgO)
    const centralSymbol = symbolsList[0];
    const styleCentral = getAtomStyle(centralSymbol);
    const elemCentral = ELEMENTS.find(e => e.symbol === centralSymbol) || {};

    atoms[0] = {
      index: 0,
      symbol: centralSymbol,
      name: elemCentral.name || centralSymbol,
      number: elemCentral.number || 1,
      category: elemCentral.category || 'reactive-nonmetal',
      color: styleCentral.color,
      emissive: styleCentral.emissive,
      position: [0, 0, 0],
      radius: styleCentral.radius
    };

    const remainingCount = total - 1;
    for (let i = 1; i < total; i++) {
      const sym = symbolsList[i];
      const style = getAtomStyle(sym);
      const elemObj = ELEMENTS.find(e => e.symbol === sym) || {};

      // Symmetrical 3D distribution around central atom
      const phi = Math.acos(-1 + (2 * (i - 1)) / Math.max(1, remainingCount));
      const theta = Math.sqrt(remainingCount * Math.PI) * phi;
      const r = 1.15;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      atoms[i] = {
        index: i,
        symbol: sym,
        name: elemObj.name || sym,
        number: elemObj.number || 1,
        category: elemObj.category || 'reactive-nonmetal',
        color: style.color,
        emissive: style.emissive,
        position: [x, y, z],
        radius: style.radius
      };

      bonds.push({ from: 0, to: i, type: 'single' });
    }
  }

  // --- AUTOMATIC 3D BOUNDING SPHERE NORMALIZATION ---
  // Calculates the bounding radius of all generated 3D atoms.
  // If the structure is larger than 2.2 units (e.g. 56-atom soap chain or large formula),
  // automatically scale coordinates & radii so it fits 100% inside the 3D viewport canvas!
  let maxExtent = 0.1;
  atoms.forEach(atom => {
    if (!atom) return;
    const dist = Math.sqrt(atom.position[0] ** 2 + atom.position[1] ** 2 + atom.position[2] ** 2) + atom.radius;
    if (dist > maxExtent) maxExtent = dist;
  });

  if (maxExtent > 2.2) {
    const scaleFactor = 2.2 / maxExtent;
    atoms.forEach(atom => {
      if (!atom) return;
      atom.position = [
        atom.position[0] * scaleFactor,
        atom.position[1] * scaleFactor,
        atom.position[2] * scaleFactor
      ];
      atom.radius = Math.max(0.16, atom.radius * Math.sqrt(scaleFactor));
    });
  }

  return { atoms, bonds };
}

// Formats symbol counts cleanly: ['C','C','H','H','H','O'] -> "2 C • 3 H • 1 O"
export function formatAtomCounts(symbolsList) {
  if (!symbolsList || symbolsList.length === 0) return 'Empty Workbench';

  const counts = symbolsList.reduce((acc, sym) => {
    acc[sym] = (acc[sym] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([sym, count]) => `${count} ${sym}`)
    .join('  •  ');
}
