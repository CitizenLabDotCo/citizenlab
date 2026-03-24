import { SupportedLocale } from 'typings';

export interface WeglotData {
  locale: string;
  body: string;
}

// Represents a submission with no Weglot translation data (the default case).
export type WeglotDataOrEmpty = WeglotData | Record<string, never>;

/**
 * Returns the current Weglot language if Weglot is active,
 * or null if Weglot is not loaded.
 */
export function getWeglotCurrentLang(): string | null {
  return window.Weglot?.getCurrentLang() ?? null;
}

/**
 * Returns the Weglot source language if the page is currently being viewed
 * in a language different from the platform's primary locale, or null otherwise.
 * Use this to check whether Weglot translation is active and get the source
 * language in one call — avoids calling getWeglotCurrentLang() twice.
 */
export function getWeglotSourceLang(
  mainLocale: SupportedLocale
): string | null {
  const weglotLang = getWeglotCurrentLang();
  if (!weglotLang) return null;
  const mainLangCode = mainLocale.split('-')[0];
  return weglotLang !== mainLangCode ? weglotLang : null;
}

/**
 * Shared fetch logic for both weglotTranslate and weglotTranslateHtml.
 * Sends a batch of words to the Weglot REST API and returns the translated strings,
 * or null on any failure so callers can gracefully degrade.
 */
async function callWeglotApi(
  words: { w: string; t: number }[],
  fromLang: string,
  toLang: string,
  apiKey: string
): Promise<string[] | null> {
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

    if (!response.ok) return null;

    const data = await response.json();
    return (data.to_words as string[] | undefined) ?? null;
  } catch {
    return null;
  }
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

  const translated = await callWeglotApi(
    textNodes.map((n) => ({ w: n.textContent!, t: 1 })),
    fromLang,
    toLang,
    apiKey
  );

  if (!translated || translated.length !== textNodes.length) return html;

  textNodes.forEach((n, i) => {
    n.textContent = translated[i];
  });

  return doc.body.innerHTML;
}

/**
 * Translates a plain text string via the Weglot REST API.
 * Returns the translated text, or the original on failure (graceful degradation).
 */
export async function weglotTranslate(
  text: string,
  fromLang: string,
  toLang: string,
  apiKey: string
): Promise<string> {
  const translated = await callWeglotApi(
    [{ w: text, t: 1 }],
    fromLang,
    toLang,
    apiKey
  );
  return translated?.[0] ?? text;
}

/**
 * Translates a plain-text submission (comments, official feedback) if Weglot
 * is active and the user is viewing in a non-primary locale.
 * Returns the translated text and weglot metadata, or the original text
 * with empty metadata when no translation is needed.
 */
export async function weglotTranslateSubmission(
  text: string,
  locale: SupportedLocale,
  weglotApiKey: string | null | undefined
): Promise<{ translatedText: string; weglotData: WeglotDataOrEmpty }> {
  const weglotSourceLang = getWeglotSourceLang(locale);

  if (weglotApiKey && weglotSourceLang) {
    const translatedText = await weglotTranslate(
      text,
      weglotSourceLang,
      locale,
      weglotApiKey
    );
    return {
      translatedText,
      weglotData: { locale: weglotSourceLang, body: text },
    };
  }

  return { translatedText: text, weglotData: {} };
}

/**
 * Translates an idea submission (plain-text title + HTML body) if Weglot
 * is active and the user is viewing in a non-primary locale.
 * Returns translated values and weglot metadata, or originals with empty
 * metadata when no translation is needed.
 */
export async function weglotTranslateIdeaSubmission(
  title: string | undefined,
  bodyHtml: string | undefined,
  locale: SupportedLocale,
  weglotApiKey: string | null | undefined
): Promise<{
  translatedTitle: string | undefined;
  translatedBody: string | undefined;
  weglotData: WeglotDataOrEmpty;
}> {
  const weglotSourceLang = getWeglotSourceLang(locale);

  if (weglotApiKey && weglotSourceLang) {
    const translatedTitle = title
      ? await weglotTranslate(title, weglotSourceLang, locale, weglotApiKey)
      : undefined;

    const translatedBody = bodyHtml
      ? await weglotTranslateHtml(
          bodyHtml,
          weglotSourceLang,
          locale,
          weglotApiKey
        )
      : undefined;

    return {
      translatedTitle,
      translatedBody,
      weglotData: { locale: weglotSourceLang, body: bodyHtml ?? '' },
    };
  }

  return { translatedTitle: title, translatedBody: bodyHtml, weglotData: {} };
}
