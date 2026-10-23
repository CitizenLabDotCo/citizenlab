import { captureMessage, withScope } from '@sentry/react';
import { SupportedLocale } from 'typings';

import { baseReportTags, secondsSincePageLoad } from 'utils/loggingUtils';

export interface WeglotData {
  locale: string;
  body: string;
}

// Represents a submission with no Weglot translation data (the default case).
export type WeglotDataOrEmpty = WeglotData | Record<string, never>;

/**
 * Weglot's script is fetched from their CDN, so `window.Weglot` appears some
 * time after the first render. Components that read it cannot wait for an
 * incidental re-render, so App announces readiness once initialize() returns.
 */
export const WEGLOT_READY_EVENT = 'weglot:ready';

/**
 * The languages offered by the tenant's Weglot project: the source language
 * followed by each enabled target. Empty until Weglot has loaded and
 * initialized, which it does asynchronously.
 */
export function getWeglotLanguages(): string[] {
  try {
    return window.Weglot?.getAvailableLanguages() ?? [];
  } catch {
    // Weglot has no documented contract for calling this before it finishes
    // initializing, so treat any failure as "nothing to offer yet".
    return [];
  }
}

/**
 * A language's name in that same language: 'pl' -> 'polski', 'de' -> 'Deutsch'.
 * Capitalisation comes from CLDR and follows each language's own orthography,
 * so names are deliberately left as that language writes them rather than
 * title-cased for UI consistency. Falls back to the upper-cased code for a
 * language the runtime cannot name.
 */
export function getLanguageEndonym(languageCode: string): string {
  try {
    return (
      new Intl.DisplayNames([languageCode], { type: 'language' }).of(
        languageCode
      ) ?? languageCode.toUpperCase()
    );
  } catch {
    return languageCode.toUpperCase();
  }
}

/**
 * Returns the Weglot source language if the page is currently being viewed
 * in a language different from the platform's primary locale, or null otherwise.
 */
function getWeglotSourceLang(mainLocale: SupportedLocale): string | null {
  const weglotLang = window.Weglot?.getCurrentLang() ?? null;
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
async function weglotTranslateHtml(
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
async function weglotTranslate(
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

/**
 * Our switcher reads the languages to offer from Weglot's script. If Weglot
 * ever changes that contract, the component renders nothing and the switcher
 * silently disappears — the very bug it exists to fix, and invisible to us
 * until a customer reports it. This reports the case where Weglot says it is
 * initialized but offers us fewer than two languages to switch between.
 *
 * It deliberately does not report Weglot failing to load or initialize at all:
 * an ad blocker or a blocked CDN does that routinely, which would bury the
 * signal in noise. Weglot logs its own console error in those cases.
 */
export function reportMissingWeglotLanguages(languages: string[]) {
  const message =
    'Weglot initialized but offered no languages to the navbar switcher';

  // eslint-disable-next-line no-console
  console.warn(
    `${message}. The switcher will not render. This usually means Weglot changed getAvailableLanguages().`
  );

  withScope((scope) => {
    scope.setLevel('error');
    scope.setTags(baseReportTags());
    scope.setContext('weglot_switcher', {
      path: window.location.pathname,
      seconds_since_page_load: secondsSincePageLoad(),
      languages_offered: languages,
      current_language: window.Weglot?.getCurrentLang() ?? null,
    });
    captureMessage(message);
  });
}
