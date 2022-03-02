import { Multiloc, GraphqlMultiloc, Locale } from 'typings';
import { keys, uniq, isArray, isObject, isEmpty, get, has } from 'lodash-es';
import {
  isNilOrError,
  NilOrError,
  convertToGraphqlLocale,
} from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';
import { InputTerm } from 'services/participationContexts';
import { MessageDescriptor } from './cl-intl';

type IInputTermMessages = {
  [key in InputTerm]: ReactIntl.FormattedMessage.MessageDescriptor;
};

export const getInputTermMessage = (
  inputType: InputTerm,
  messages: IInputTermMessages
) => {
  return messages[inputType];
};

const withFallback = (
  value: string,
  locale: Locale | NilOrError,
  fallbackMessage?: MessageDescriptor
) => {
  if (
    value.length === 0 &&
    !isNilOrError(locale) &&
    fallbackMessage &&
    fallbackMessage[locale]
  ) {
    return fallbackMessage[locale];
  }

  return value;
};

export function getLocalized(
  multiloc: Multiloc | GraphqlMultiloc | null | undefined,
  locale: Locale | NilOrError,
  tenantLocales: Locale[] | NilOrError,
  maxLength?: number,
  fallbackMessage?: MessageDescriptor
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
      return withFallback(winner, locale, fallbackMessage);
    }

    if (isObject(multiloc) && !isEmpty(multiloc)) {
      const multilocLocales = keys(multiloc) as Locale[];
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

      return withFallback(truncate(winner, maxLength), locale, fallbackMessage);
    }
  }

  return withFallback('', locale, fallbackMessage);
}
