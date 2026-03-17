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
  return window.Weglot?.getCurrentLang() ?? null;
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
 * Translates an HTML string by extracting text nodes, translating them in a single
 * API call (replicating Weglot's own parser approach), then injecting translations back.
 * Preserves all HTML structure, images, links, and formatting.
 * Returns the original HTML on failure (graceful degradation).
 */
export async function weglotTranslateHtml(
  html: string,
  fromLang: string,
  toLang: string,
  apiKey: string
): Promise<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if ((node as Text).textContent?.trim()) {
      textNodes.push(node as Text);
    }
  }

  if (textNodes.length === 0) return html;

  const words = textNodes.map((n) => ({ w: n.textContent!, t: 1 }));

  try {
    const response = await fetch(
      `https://api.weglot.com/translate?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l_from: fromLang,
          l_to: toLang.split('-')[0],
          request_url: window.location.href,
          words,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return html;

    const data = await response.json();
    const translated = data.to_words as string[] | undefined;
    if (!translated || translated.length !== textNodes.length) return html;

    textNodes.forEach((n, i) => {
      n.textContent = translated[i];
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
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
          l_to: toLang.split('-')[0],
          request_url: window.location.href,
          words: [{ w: text, t: 1 }],
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return text;

    const data = await response.json();
    return data.to_words?.[0] ?? text;
  } catch {
    return text; // Graceful degradation
  }
}
