/**
 * Centralized Gemini API Key Storage Utility
 * Provides a single source of truth for the Gemini API key across the entire suite:
 * Landing / Setup (/), JAM (/jam), STAR Coach (/behavioral), and Mock HR (/mock-hr).
 */

export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

// Legacy keys for automatic migration
const LEGACY_STORAGE_KEYS = ['app_gemini_api_key', 'app_api_key'];

/**
 * Retrieve the configured Gemini API key from central localStorage.
 * Automatically checks and migrates legacy keys if found.
 */
export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const primaryKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (primaryKey && primaryKey.trim()) {
      return primaryKey.trim();
    }

    // Check legacy storage keys for backward compatibility
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const val = localStorage.getItem(legacyKey);
      if (val && val.trim()) {
        const cleanKey = val.trim();
        // Migrate to standard key
        localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, cleanKey);
        return cleanKey;
      }
    }
  } catch (err) {
    console.error('Failed to read Gemini API key from localStorage:', err);
  }

  return null;
}

/**
 * Store the Gemini API key into central localStorage.
 */
export function setGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;

  try {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      removeGeminiApiKey();
      return;
    }

    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmed);

    // Keep legacy keys in sync or clean them up so old code paths don't conflict
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      localStorage.setItem(legacyKey, trimmed);
    }

    // Dispatch a storage event so all tabs/listeners update immediately
    window.dispatchEvent(new Event('gemini_api_key_updated'));
  } catch (err) {
    console.error('Failed to store Gemini API key in localStorage:', err);
  }
}

/**
 * Remove the configured Gemini API key from central and legacy storage.
 */
export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(legacyKey);
    }

    window.dispatchEvent(new Event('gemini_api_key_updated'));
  } catch (err) {
    console.error('Failed to remove Gemini API key from localStorage:', err);
  }
}

/**
 * Check whether a valid Gemini API key is currently configured.
 */
export function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 5);
}
