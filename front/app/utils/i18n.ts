import { keys, uniq, isArray, isObject, isEmpty, get, has } from 'lodash-es';
import { MessageDescriptor } from 'react-intl';
import { Multiloc, GraphqlMultiloc, SupportedLocale } from 'typings';

import { InputTerm } from 'api/phases/types';

import { isNilOrError, convertToGraphqlLocale } from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';

type IInputTermMessages = {
  [key in InputTerm]: MessageDescriptor;
};

export const getInputTermMessage = (
  inputType: InputTerm,
  messages: IInputTermMessages
) => {
  return messages[inputType];
};

export function getLocalized(
  multiloc: Multiloc | GraphqlMultiloc | null | undefined,
  locale: SupportedLocale | null | undefined | Error,
  tenantLocales: SupportedLocale[] | null | undefined | Error,
  maxLength?: number
) {
  if (
    !isNilOrError(multiloc) &&
    !isNilOrError(locale) &&
    !isNilOrError(tenantLocales) &&
    tenantLocales.length > 0
  ) {
    const graphqlLocale = convertToGraphqlLocale(locale);
    const graphqlTenantLocales = tenantLocales.map((tenantLocale) =>
      convertToGraphqlLocale(tenantLocale)
    );
    const baseLocales = uniq([
      locale,
      graphqlLocale,
      ...tenantLocales,
      ...graphqlTenantLocales,
    ]);

    if (
      isArray(multiloc) &&
      !isEmpty(multiloc) &&
      has(multiloc[0], 'content') &&
      has(multiloc[0], 'locale')
    ) {
      const multilocLocales = multiloc.map((item) => item.locale);
      const graphqlMultilocLocales = multilocLocales.map((multilocLocale) =>
        convertToGraphqlLocale(multilocLocale)
      );
      const candidateLocales = uniq([
        ...baseLocales,
        ...multilocLocales,
        ...graphqlMultilocLocales,
      ]).filter((locale) => !locale.startsWith('__'));
      const winnerLocale = candidateLocales.find((locale) =>
        multiloc.some((item) => item.locale === locale)
      );
      const winner = get(
        multiloc.find((item) => item.locale === winnerLocale),
        'content',
        ''
      );
      return winner;
    }

    if (isObject(multiloc) && !isEmpty(multiloc)) {
      // Return value for exactly the same locale
      if (multiloc[locale]) return truncate(multiloc[locale], maxLength);

      const multilocLocales = keys(multiloc) as SupportedLocale[];

      // Return value for a locale of the same language
      const sameLanguageLocale = findSimilarLocale(locale, multilocLocales);
      if (!isNilOrError(sameLanguageLocale) && !!multiloc[sameLanguageLocale]) {
        return truncate(multiloc[sameLanguageLocale], maxLength);
      }

      const graphqlMultilocLocales = multilocLocales.map((multilocLocale) =>
        convertToGraphqlLocale(multilocLocale)
      );
      const candidateLocales = uniq([
        ...baseLocales,
        ...multilocLocales,
        ...graphqlMultilocLocales,
      ]).filter((locale) => !locale.startsWith('__'));
      const winnerLocale = candidateLocales.find(
        (locale) => !!multiloc[locale]
      );
      const winner = winnerLocale ? multiloc[winnerLocale] : '';
      return truncate(winner, maxLength);
    }
  }

  return '';
}

export function getLocalizedWithFallback(
  multiloc: Multiloc | null | undefined,
  locale: SupportedLocale | null | undefined | Error,
  tenantLocales: SupportedLocale[] | null | undefined | Error,
  maxLength?: number,
  fallback?: string
) {
  if (!multiloc || isNilOrError(locale)) {
    return fallback
      ? truncate(fallback, maxLength)
      : getLocalized(multiloc, locale, tenantLocales, maxLength);
  }

  if (isMissing(multiloc[locale]) && fallback) {
    return truncate(fallback, maxLength);
  }

  return getLocalized(multiloc, locale, tenantLocales, maxLength);
}

const isMissing = (value?: string) => !value || value.length === 0;

export function getLanguage(locale: SupportedLocale) {
  return locale.indexOf('-') > -1 ? locale.split('-')[0] : locale;
}

export function findSimilarLocale(
  locale: SupportedLocale,
  candidateLocales: SupportedLocale[]
) {
  const localeLanguage = getLanguage(locale);
  const localeLanguages = candidateLocales.map(getLanguage);

  const similarLocaleIndex = localeLanguages.findIndex(
    (language) => language === localeLanguage
  );

  return similarLocaleIndex > -1 ? candidateLocales[similarLocaleIndex] : null;
}
