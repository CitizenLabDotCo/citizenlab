import useAppConfiguration from 'hooks/useAppConfiguration';
import { includes } from 'lodash-es';
import { useEffect, useState } from 'react';
import { GraphqlLocale } from 'typings';
import { convertToGraphqlLocale, isNilOrError } from 'utils/helperUtils';

export default function useGraphqlTenantLocales() {
  const [graphqlTenantLocales, setGraphqlTenantLocales] = useState<
    GraphqlLocale[]
  >(['en']);
  const tenant = useAppConfiguration();

  useEffect(() => {
    if (isNilOrError(tenant)) return;

    const graphqlLocales = tenant.attributes.settings.core.locales.map(
      (locale) => convertToGraphqlLocale(locale)
    );

    if (!includes(graphqlLocales, 'en')) {
      graphqlLocales.push('en');
    }

    setGraphqlTenantLocales(graphqlLocales);

    return () => setGraphqlTenantLocales(['en']);
  }, [tenant]);

  return graphqlTenantLocales;
}
