import { useMemo } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { convertToGraphqlLocale } from 'utils/helperUtils';

export default function useGraphqlTenantLocales() {
  const { data: appConfig } = useAppConfiguration();

  return useMemo(() => {
    if (!appConfig) return null;

    const graphqlLocales = appConfig.data.attributes.settings.core.locales.map(
      (locale) => convertToGraphqlLocale(locale)
    );

    if (!graphqlLocales.includes('en')) {
      graphqlLocales.push('en');
    }

    return graphqlLocales;
  }, [appConfig]);
}
