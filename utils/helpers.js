
import {boroughMap, neighborhoodMap} from './borough_neighborhood_map.js';




/**
 * Enrich a raw API item with borough_full and neighborhoods.
 * @param {Object} item - Raw project item from NYC Open Data API.
 * @returns {Object} Enriched project document for MongoDB.
 */
export function enrichData(item) {
  const boroughCode = (item.borough || '').trim().toUpperCase();
  const district = parseInt(item.council_district);
  const key = `${boroughCode}-${district}`;

  return {
    id: item.id || null,
    reported: item.reported || null,
    fiscal_year: item.fiscal_year || null,
    borough: boroughCode,
    borough_full: boroughMap[boroughCode] || "Unknown",
    council_district: isNaN(district) ? null : district,
    neighborhoods: neighborhoodMap[key] || [],
    sponsor: item.sponsor || null,
    title: item.title || null,
    description: item.description || null,
    budget_line: item.budget_line || null,
    award: item.award ? parseFloat(item.award) : 0
  };
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}