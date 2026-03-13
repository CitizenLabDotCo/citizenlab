import { SupportedLocale } from 'typings';

export interface WeglotData {
  locale: string;
  body: string;
}

/**
 * Returns the current Weglot language if Weglot is active,
 * or null if Weglot is not loaded.
 */
export function getWeglotCurrentLang(): string | null {
  return window.Weglot?.getCurrentLang?.() ?? null;
}

/**
 * Checks if Weglot is active and the user is on a translated page
 * (i.e., the current Weglot language differs from the platform's main locale).
 */
export function isWeglotTranslatedPage(mainLocale: SupportedLocale): boolean {
  const weglotLang = getWeglotCurrentLang();
  if (!weglotLang) return false;

  // Compare 2-letter Weglot code against the main locale
  // e.g., "fr" !== "en", or "en" === "en"
  const mainLangCode = mainLocale.split('-')[0];
  return weglotLang !== mainLangCode;
}

/**
 * Calls the Weglot REST API to translate text from one language to another.
 * Returns the translated text, or the original text on failure (graceful degradation).
 */
export async function weglotTranslate(
  text: string,
  fromLang: string,
  toLang: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.weglot.com/translate?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l_from: fromLang,
          l_to: toLang.split('-')[0], // Weglot expects 2-letter ISO codes
          words: [{ w: text, t: 3 }], // t:3 for HTML content
        }),
        signal: AbortSignal.timeout(5000), // 5s timeout
      }
    );

    if (!response.ok) return text;

    const data = await response.json();
    return data.to_words?.[0] ?? text;
  } catch {
    return text; // Graceful degradation
  }
}
