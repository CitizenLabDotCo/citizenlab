import { useState, useEffect } from 'react';
import { isNilOrError, convertToGraphqlLocale } from 'utils/helperUtils';
import { GraphqlLocale } from 'typings';
import { includes } from 'lodash-es';
import useTenant from 'hooks/useTenant';

export default function useGraphqlTenantLocales() {
  const [graphqlTenantLocales, setGraphqlTenantLocales] = useState<
    GraphqlLocale[]
  >(['en']);
  const tenant = useTenant();

  useEffect(() => {
    if (isNilOrError(tenant)) return;

    const graphqlLocales = tenant.data.attributes.settings.core.locales.map(
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
