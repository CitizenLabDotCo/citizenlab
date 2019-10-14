import useGraphqlLocale from 'hooks/useGraphqlLocale';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import { Multiloc } from 'typings';

export default function useGraphqlLocalize() {
  const graphqlLocale = useGraphqlLocale();
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const graphqlLocalize = (multiloc: Multiloc, maxChar?: number) => {
    if (!isNilOrError(graphqlLocale) && !isNilOrError(graphqlTenantLocales)) {
      return getLocalized(multiloc, graphqlLocale, graphqlTenantLocales, maxChar);
    }

    return '';
  };

  return graphqlLocalize;
}
