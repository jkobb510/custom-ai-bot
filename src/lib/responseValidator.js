import rejectedPhrasesData from '../config/rejected-phrases.json';

const hedgingPhrases = rejectedPhrasesData.hedgingPhrases;

/**
 * Check if response contains any hedging phrases
 */
export function checkForHedgingPhrases(text) {
  const foundPhrases = [];
  
  for (const phrase of hedgingPhrases) {
    // Case-insensitive search
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      foundPhrases.push(phrase);
    }
  }
  
  return foundPhrases;
}

/**
 * Determine if a phrase is purely defensive or contains useful information
 * Returns true if purely defensive, false if contains useful info
 */
function isPurelyDefensive(text, phrase) {
  // If removing the phrase leaves meaningful content, it's useful
  const withoutPhrase = text.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
  
  // If very little content remains, the phrase is likely pure filler
  if (withoutPhrase.length < 20) {
    return true;
  }
  
  // Check if what remains is substantive
  const words = withoutPhrase.split(/\s+/).filter(w => w.length > 0);
  return words.length < 5;
}

/**
 * Strip out purely defensive phrases
 */
export function stripDefensivePhrases(text, foundPhrases) {
  let cleaned = text;
  
  for (const phrase of foundPhrases) {
    if (isPurelyDefensive(text, phrase)) {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      cleaned = cleaned.replace(regex, '').trim();
    }
  }
  
  return cleaned;
}

/**
 * Main validation function
 * Returns { passed: boolean, original: string, cleaned: string }
 */
export function validateResponse(response) {
  const foundPhrases = checkForHedgingPhrases(response);
  
  if (foundPhrases.length === 0) {
    return {
      passed: true,
      original: response,
      cleaned: response,
      message: 'Response passed validation'
    };
  }
  
  // Found hedging phrases - try to clean
  const cleaned = stripDefensivePhrases(response, foundPhrases);
  
  return {
    passed: false,
    original: response,
    cleaned: cleaned || response, // fallback to original if cleaning results in empty string
    foundPhrases: foundPhrases,
    message: `Found ${foundPhrases.length} hedging phrase(s). Response has been cleaned.`
  };
}
