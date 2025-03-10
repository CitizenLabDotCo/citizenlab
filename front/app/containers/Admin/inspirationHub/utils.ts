import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';
import { Multiloc, SupportedLocale } from 'typings';

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

type TranslateableAttribute = 'title' | 'description' | 'folder_title';

export const useLocalizeProjectLibrary = () => {
  const locale = useLocale();

  return useCallback(
    (
      resource: ProjectLibraryProjectData | ProjectLibraryPhaseData,
      attribute: TranslateableAttribute
    ) => {
      return getWithFallback(locale, resource, attribute);
    },
    [locale]
  );
};

const getWithFallback = (
  currentLocale: SupportedLocale,
  resource: ProjectLibraryProjectData | ProjectLibraryPhaseData,
  translateableAttribute: TranslateableAttribute
) => {
  const multiloc = getMultiloc(resource, translateableAttribute);

  // Try grabbing the title in the current locale
  const currentLocaleTitle = multiloc[currentLocale];

  // If not available, try grabbing the title in a similar locale
  const similarLocale = findSimilarLocale(currentLocale, keys(multiloc));
  const similarLocaleTitle = similarLocale
    ? multiloc[similarLocale]
    : undefined;

  // If neither of those are available, fallback to English
  return (
    currentLocaleTitle ??
    similarLocaleTitle ??
    resource.attributes[
      ATTRIBUTE_TO_ENGLISH_ATTRIBUTE[translateableAttribute]
    ] ??
    ''
  );
};

const getMultiloc = (
  resource: ProjectLibraryProjectData | ProjectLibraryPhaseData,
  translateableAttribute: TranslateableAttribute
) => {
  if (resource.type === 'project_library_phase') {
    if (translateableAttribute === 'title') {
      return resource.attributes.title_multiloc;
    }

    if (translateableAttribute === 'description') {
      return resource.attributes.description_multiloc;
    }
  } else {
    if (translateableAttribute === 'title') {
      return resource.attributes.title_multiloc;
    }

    if (translateableAttribute === 'description') {
      return resource.attributes.description_multiloc;
    }

    return resource.attributes.folder_title_multiloc;
  }

  return {} as Multiloc;
};

const ATTRIBUTE_TO_ENGLISH_ATTRIBUTE = {
  title: 'title_en',
  description: 'description_en',
  folder_title: 'folder_title_en',
} as const;
