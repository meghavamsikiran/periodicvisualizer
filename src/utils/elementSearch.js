/**
 * Centralized element search utility.
 * Used by PeriodicTable, ElementSelectorModal, and SpatialLabAR.
 * 
 * Strict matching: only name, symbol, and atomic number.
 * This prevents false positives from summary/uses text
 * (e.g., "phos" matching Yttrium because its uses mention "phosphor").
 */

/**
 * Check if an element matches the given search query and category filter.
 * @param {Object} elem - Element object from periodicData
 * @param {string} queryText - Raw search input string
 * @param {string} [categoryId='all'] - Category filter ID
 * @returns {boolean}
 */
export function matchesElementSearch(elem, queryText, categoryId = 'all') {
  const matchesCategory = categoryId === 'all' || elem.category === categoryId;
  const q = (queryText || '').trim().toLowerCase();

  if (!q) return matchesCategory;

  // Priority 1: Exact symbol match (case-insensitive)
  if (elem.symbol.toLowerCase() === q) return matchesCategory;

  // Priority 2: Symbol starts with query (e.g., "c" matches "C", "Ca", "Cd", etc.)
  if (elem.symbol.toLowerCase().startsWith(q)) return matchesCategory;

  // Priority 3: Element name contains query (e.g., "cadm" matches "Cadmium")
  if (elem.name.toLowerCase().includes(q)) return matchesCategory;

  // Priority 4: Exact atomic number match (e.g., "48" matches Cadmium)
  if (elem.number.toString() === q) return matchesCategory;

  // Nothing else — no summary, no uses, no state, no category text matching.
  return false;
}

/**
 * Filter an array of elements by search query and category.
 * @param {Array} elements - Array of element objects
 * @param {string} queryText - Raw search input string
 * @param {string} [categoryId='all'] - Category filter ID
 * @returns {Array} Filtered elements
 */
export function filterElements(elements, queryText, categoryId = 'all') {
  return elements.filter(elem => matchesElementSearch(elem, queryText, categoryId));
}
