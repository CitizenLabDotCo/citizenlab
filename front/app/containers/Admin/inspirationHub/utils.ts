import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';
import { Multiloc, SupportedLocale } from 'typings';

import { Country } from 'api/project_library_countries/types';
import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';
import { RansackParams } from 'api/project_library_projects/types';

import useLocale from 'hooks/useLocale';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { keys } from 'utils/helperUtils';
import { findSimilarLocale } from 'utils/i18n';

export const setRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName,
  paramValue: RansackParams[ParamName]
) => {
  const isNullishParam =
    !paramValue || (Array.isArray(paramValue) && paramValue.length === 0);

  if (isNullishParam) {
    removeSearchParams([paramName]);
  } else {
    updateSearchParams({ [paramName]: paramValue });
  }
};

export const useRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName
): RansackParams[ParamName] => {
  const [searchParams] = useSearchParams();

  const paramValue = searchParams.get(paramName);

  if (paramName.endsWith('in]')) {
    return (
      paramValue === null ? [] : JSON.parse(paramValue)
    ) as RansackParams[typeof paramName];
  }

  return paramValue as RansackParams[typeof paramName];
};

const RANSACK_PARAMS: (keyof RansackParams)[] = [
  'q[tenant_country_code_in]',
  'q[phases_participation_method_in]',
  'q[tenant_population_group_in]',
  'q[topic_id_in]',
  'q[practical_end_at_gteq]',
  'q[practical_end_at_lt]',
  'q[title_en_or_description_en_or_tenant_name_or_title_multiloc_text_cont]',
  'q[s]',
];

export const useRansackParams = () => {
  const [searchParams] = useSearchParams();
  return useMemo(
    () =>
      RANSACK_PARAMS.reduce((acc, paramName) => {
        let value = searchParams.get(paramName);

        if (value === null) {
          return acc;
        }

        if (paramName.endsWith('in]')) {
          value = JSON.parse(value);
        }

        return {
          ...acc,
          [paramName]: value as RansackParams[typeof paramName],
        };
      }, {} as RansackParams),
    [searchParams]
  );
};

export const clearRansackParams = () => {
  removeSearchParams(RANSACK_PARAMS);
};

export const useLocalizeProjectLibrary = () => {
  const locale = useLocale();

  return useCallback(
    (multiloc: Multiloc, fallback: string | null) => {
      return getWithFallback(locale, multiloc, fallback);
    },
    [locale]
  );
};

const getWithFallback = (
  currentLocale: SupportedLocale,
  multiloc: Multiloc,
  fallback: string | null
) => {
  // Try grabbing the title in the current locale
  const currentLocaleTitle = multiloc[currentLocale];

  // If not available, try grabbing the title in a similar locale
  const similarLocale = findSimilarLocale(currentLocale, keys(multiloc));
  const similarLocaleTitle = similarLocale
    ? multiloc[similarLocale]
    : undefined;

  // If neither of those are available, fallback to English
  return currentLocaleTitle ?? similarLocaleTitle ?? fallback ?? '';
};

export const useCountriesByCode = () => {
  const { data: countries } = useProjectLibraryCountries();

  const countriesByCode = useMemo(() => {
    if (!countries) return;

    return countries.data.attributes.reduce((acc, country) => {
      acc[country.code] = country;
      return acc;
    }, {} as Record<string, Country>);
  }, [countries]);

  return countriesByCode;
};
