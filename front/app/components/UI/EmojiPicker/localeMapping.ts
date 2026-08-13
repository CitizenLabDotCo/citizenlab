import { SupportedLocale } from 'typings';

// Emoji-mart supported locales:
// ar, be, cs, de, en, es, fa, fi, fr, hi, it, ja, ko, nl, pl, pt, ru, sa, tr, uk, vi, zh
//
// This function maps our app locales (e.g., 'nl-BE', 'fr-FR') to emoji-mart locale codes.
// If the base language is not supported by emoji-mart, it falls back to English.
const SUPPORTED_EMOJI_MART_LOCALES = new Set([
  'ar',
  'be',
  'cs',
  'de',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'hi',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'ru',
  'sa',
  'tr',
  'uk',
  'vi',
  'zh',
]);

export function getEmojiMartLocale(appLocale: SupportedLocale): string {
  // Extract base language code (e.g., 'nl-BE' -> 'nl', 'fr-FR' -> 'fr')
  const baseLocale = appLocale.split('-')[0].toLowerCase();

  // Use base locale if supported, otherwise fall back to English
  if (SUPPORTED_EMOJI_MART_LOCALES.has(baseLocale)) {
    return baseLocale;
  }

  return 'en';
}
