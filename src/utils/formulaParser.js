// Parses chemical formulas like "H2O", "H2O2", "CO2", "NaCl", "CH4", "H2SO4", "NaOH", "C2H5OH" into atom counts

export function parseChemicalFormula(formulaStr) {
  if (!formulaStr || typeof formulaStr !== 'string') return null;

  const clean = formulaStr.trim();
  if (!clean) return null;

  // Regex to capture Element Symbol (e.g. H, Na, Cl, Fe, O) and Optional Count (e.g. 2, 4)
  const elementRegex = /([A-Z][a-z]?)(?:_?(\d+))?/g;
  const result = {};
  let match;

  let totalMatchedLength = 0;
  while ((match = elementRegex.exec(clean)) !== null) {
    const symbol = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    result[symbol] = (result[symbol] || 0) + count;
    totalMatchedLength += match[0].length;
  }

  if (Object.keys(result).length === 0) return null;

  // Flatten counts into an array of symbol strings: e.g. { H: 2, O: 2 } -> ['H', 'H', 'O', 'O']
  const symbolsList = [];
  Object.entries(result).forEach(([symbol, count]) => {
    for (let i = 0; i < count; i++) {
      symbolsList.push(symbol);
    }
  });

  return {
    counts: result,
    symbolsList
  };
}
