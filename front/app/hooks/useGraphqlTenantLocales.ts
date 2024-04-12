import { useState, useEffect } from 'react';

import { includes } from 'lodash-es';
import { GraphqlLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { isNilOrError, convertToGraphqlLocale } from 'utils/helperUtils';

export default function useGraphqlTenantLocales() {
  const [graphqlTenantLocales, setGraphqlTenantLocales] = useState<
    GraphqlLocale[]
  >(['en']);
  const { data: appConfig } = useAppConfiguration();

  useEffect(() => {
    if (isNilOrError(appConfig)) return;

    const graphqlLocales = appConfig.data.attributes.settings.core.locales.map(
      (locale) => convertToGraphqlLocale(locale)
    );

    if (!includes(graphqlLocales, 'en')) {
      graphqlLocales.push('en');
    }

    setGraphqlTenantLocales(graphqlLocales);

    return () => setGraphqlTenantLocales(['en']);
  }, [appConfig]);

  return graphqlTenantLocales;
}
