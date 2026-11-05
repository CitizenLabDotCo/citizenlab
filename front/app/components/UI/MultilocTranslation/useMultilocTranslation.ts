import { useState } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import useTranslateMultiloc from 'api/machine_translations/useTranslateMultiloc';
import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { isAdmin, isModerator } from 'utils/permissions/roles';

import { hasContent } from './utils';

interface Parameters {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (multiloc: Multiloc) => void;
  html?: boolean;
}

export interface MultilocTranslation {
  // True when the user can machine translate this multiloc.
  enabled: boolean;
  sourceLocale: SupportedLocale | undefined;
  emptyLocales: SupportedLocale[];
  isLoading: boolean;
  isError: boolean;
  translate: (targetLocales: SupportedLocale[]) => void;
  // Only for this session: nothing stores which locales are machine translations.
  isMachineTranslated: (locale: string) => boolean;
}

// Fills the empty locales of a multiloc with machine translations.
const useMultilocTranslation = ({
  valueMultiloc,
  onChange,
  html = false,
}: Parameters): MultilocTranslation => {
  const tenantLocales = useAppConfigurationLocales() ?? [];
  const uiLocale = useLocale();
  const { data: authUser } = useAuthUser();
  const featureEnabled = useFeatureFlag({ name: 'machine_translations' });
  const { mutate, isPending, isError } = useTranslateMultiloc();
  const [machineTranslatedLocales, setMachineTranslatedLocales] = useState<
    SupportedLocale[]
  >([]);

  const filledLocales = tenantLocales.filter((locale) =>
    hasContent(valueMultiloc?.[locale])
  );
  const emptyLocales = tenantLocales.filter(
    (locale) => !filledLocales.includes(locale)
  );
  // Prefer the UI locale, because the user probably wrote that text.
  const sourceLocale = filledLocales.includes(uiLocale)
    ? uiLocale
    : filledLocales.at(0);

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
          onChange({ ...valueMultiloc, ...response.data.attributes.multiloc });
          setMachineTranslatedLocales((locales) => [
            ...new Set([...locales, ...targetLocales]),
          ]);
        },
      }
    );
  };

  const isMachineTranslated = (locale: string) => {
    const translatedLocale = machineTranslatedLocales.find((l) => l === locale);
    return !!translatedLocale && hasContent(valueMultiloc?.[translatedLocale]);
  };

  return {
    enabled,
    sourceLocale,
    emptyLocales,
    isLoading: isPending,
    isError,
    translate,
    isMachineTranslated,
  };
};

export default useMultilocTranslation;
