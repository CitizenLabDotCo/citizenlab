import { useState } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import useTranslateMultiloc from 'api/machine_translations/useTranslateMultiloc';
import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import { isAdmin, isModerator } from 'utils/permissions/roles';

import messages from './messages';
import { hasContent, normalizeText } from './utils';

interface Parameters {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (multiloc: Multiloc) => void;
  html?: boolean;
}

// 'machine': a machine translation that nobody edited yet.
// 'stale': a machine translation of an older version of the source text.
export type TranslationState = 'machine' | 'stale';

interface MachineTranslationRecord {
  sourceLocale: SupportedLocale;
  // Normalized texts, because rich text editors change the markup a little.
  sourceText: string;
  translatedText: string;
}

export interface MultilocTranslation {
  // True when the user can machine translate this multiloc.
  enabled: boolean;
  sourceLocale: SupportedLocale | undefined;
  emptyLocales: SupportedLocale[];
  staleLocales: SupportedLocale[];
  localeStates: Partial<Record<SupportedLocale, TranslationState>>;
  // Accessible names of the states, for the locale switcher.
  localeStateLabels: Record<TranslationState, string>;
  // The source of the machine translation in this locale, if there is one.
  translatedFrom: (locale: string) => SupportedLocale | undefined;
  isLoading: boolean;
  isError: boolean;
  translate: (targetLocales: SupportedLocale[]) => void;
}

// Machine translates a multiloc and keeps track of which locales are machine translations.
// PoC: the tracking is in component state only, so a reload loses it. Production needs a
// persisted record per locale (machine / human / source version).
const useMultilocTranslation = ({
  valueMultiloc,
  onChange,
  html = false,
}: Parameters): MultilocTranslation => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales() ?? [];
  const uiLocale = useLocale();
  const { data: authUser } = useAuthUser();
  const featureEnabled = useFeatureFlag({ name: 'machine_translations' });
  const { mutate, isPending, isError } = useTranslateMultiloc();
  const [records, setRecords] = useState<
    Partial<Record<SupportedLocale, MachineTranslationRecord>>
  >({});

  const textOf = (locale: SupportedLocale) =>
    normalizeText(valueMultiloc?.[locale]);

  // A locale stays a machine translation until somebody edits it.
  const stateOf = (locale: SupportedLocale): TranslationState | undefined => {
    const record = records[locale];
    if (!record || textOf(locale) !== record.translatedText) return undefined;
    return textOf(record.sourceLocale) === record.sourceText
      ? 'machine'
      : 'stale';
  };

  const localeStates: Partial<Record<SupportedLocale, TranslationState>> = {};
  tenantLocales.forEach((locale) => {
    const state = stateOf(locale);
    if (state) localeStates[locale] = state;
  });

  const filledLocales = tenantLocales.filter((locale) =>
    hasContent(valueMultiloc?.[locale])
  );
  const emptyLocales = tenantLocales.filter(
    (locale) => !filledLocales.includes(locale)
  );
  const staleLocales = tenantLocales.filter(
    (locale) => localeStates[locale] === 'stale'
  );
  // Translate from text that a person wrote. Prefer the UI locale, because the user
  // probably wrote that text.
  const humanLocales = filledLocales.filter((locale) => !localeStates[locale]);
  const sourceLocale = humanLocales.includes(uiLocale)
    ? uiLocale
    : humanLocales.at(0);

  const enabled =
    featureEnabled &&
    (isAdmin(authUser) || isModerator(authUser)) &&
    tenantLocales.length > 1 &&
    sourceLocale !== undefined;

  const translate = (targetLocales: SupportedLocale[]) => {
    const sourceText = sourceLocale ? valueMultiloc?.[sourceLocale] : undefined;
    if (!sourceLocale || !sourceText || targetLocales.length === 0) return;

    mutate(
      {
        multiloc: { [sourceLocale]: sourceText },
        source_locale: sourceLocale,
        target_locales: targetLocales,
        html,
      },
      {
        onSuccess: (response) => {
          const translations = response.data.attributes.multiloc;
          onChange({ ...valueMultiloc, ...translations });
          setRecords((current) => {
            const next = { ...current };
            Object.entries(translations).forEach(([locale, text]) => {
              next[locale] = {
                sourceLocale,
                sourceText: normalizeText(sourceText),
                translatedText: normalizeText(text),
              };
            });
            return next;
          });
        },
      }
    );
  };

  const translatedFrom = (locale: string) =>
    stateOf(locale as SupportedLocale)
      ? records[locale as SupportedLocale]?.sourceLocale
      : undefined;

  return {
    enabled,
    sourceLocale,
    emptyLocales,
    staleLocales,
    localeStates,
    localeStateLabels: {
      machine: formatMessage(messages.machineTranslationState),
      stale: formatMessage(messages.staleTranslationState),
    },
    translatedFrom,
    isLoading: isPending,
    isError,
    translate,
  };
};

export default useMultilocTranslation;
