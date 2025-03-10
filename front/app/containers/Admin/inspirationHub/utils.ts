import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import { ProjectLibraryPhaseData } from 'api/project_library_phases/types';
import {
  ProjectLibraryProjectData,
  RansackParams,
} from 'api/project_library_projects/types';

import useLocale from 'hooks/useLocale';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { keys } from 'utils/helperUtils';
import { findSimilarLocale } from 'utils/i18n';

export const setRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName,
  paramValue: RansackParams[ParamName]
) => {
  if (paramValue) {
    updateSearchParams({ [paramName]: paramValue });
  } else {
    removeSearchParams([paramName]);
  }
};

export const useRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName
): RansackParams[ParamName] => {
  const [searchParams] = useSearchParams();
  return searchParams.get(paramName) as RansackParams[typeof paramName];
};

const RANSACK_PARAMS: (keyof RansackParams)[] = [
  'q[tenant_country_alpha2_eq]',
  'q[tenant_population_group_eq]',
  'q[score_total_gteq]',
  'q[phases_participation_method_eq]',
  'q[topic_id_eq]',
  'q[status_eq]',
  'q[visibility_eq]',
  'q[practical_end_at_gteq]',
  'q[practical_end_at_lt]',
  'q[title_en_or_description_en_or_tenant_name_cont]',
  'q[s]',
];

export const useRansackParams = () => {
  const [searchParams] = useSearchParams();
  return useMemo(
    () =>
      RANSACK_PARAMS.reduce((acc, paramName) => {
        const value = searchParams.get(paramName);

        if (value === null) {
          return acc;
        }

        return {
          ...acc,
          [paramName]: value as RansackParams[typeof paramName],
        };
      }, {} as RansackParams),
    [searchParams]
  );
};

export const useLocalizeProjectLibrary = () => {
  const locale = useLocale();

  return useCallback(
    (resource: ProjectLibraryProjectData | ProjectLibraryPhaseData) => {
      const title = getTitleWithFallback(locale, resource);
      const description = getDescriptionWithFallback(locale, resource);

      return { title, description };
    },
    [locale]
  );
};

const getTitleWithFallback = (
  currentLocale: SupportedLocale,
  resource: ProjectLibraryProjectData | ProjectLibraryPhaseData
) => {
  // Try grabbing the title in the current locale
  const currentLocaleTitle = resource.attributes.title_multiloc[currentLocale];

  // If not available, try grabbing the title in a similar locale
  const similarLocale = findSimilarLocale(
    currentLocale,
    keys(resource.attributes.title_multiloc)
  );
  const similarLocaleTitle = similarLocale
    ? resource.attributes.title_multiloc[similarLocale]
    : undefined;

  // If neither of those are available, fallback to English
  return (
    currentLocaleTitle ?? similarLocaleTitle ?? resource.attributes.title_en
  );
};

const getDescriptionWithFallback = (
  currentLocale: SupportedLocale,
  resource: ProjectLibraryProjectData | ProjectLibraryPhaseData
) => {
  // Try grabbing the description in the current locale
  const currentLocaleTitle =
    resource.attributes.description_multiloc[currentLocale];

  // If not available, try grabbing the description in a similar locale
  const similarLocale = findSimilarLocale(
    currentLocale,
    keys(resource.attributes.description_multiloc)
  );
  const similarLocaleTitle = similarLocale
    ? resource.attributes.description_multiloc[similarLocale]
    : undefined;

  // If neither of those are available, fallback to English
  return (
    currentLocaleTitle ??
    similarLocaleTitle ??
    resource.attributes.description_en
  );
};
