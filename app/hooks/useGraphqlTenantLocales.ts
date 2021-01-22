import { useState, useEffect } from 'react';
import { currentTenantStream } from 'services/tenant';
import { isNilOrError, convertToGraphqlLocale } from 'utils/helperUtils';
import { GraphqlLocale } from 'typings';
import { includes } from 'lodash-es';

export default function useGraphqlTenantLocales() {
  const [graphqlTenantLocales, setGraphqlTenantLocales] = useState<
    GraphqlLocale[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentTenantStream().observable.subscribe(
      (currentTenant) => {
        if (!isNilOrError(currentTenant)) {
          const graphqlLocales = currentTenant.data.attributes.settings.core.locales.map(
            (locale) => convertToGraphqlLocale(locale)
          );

          if (!includes(graphqlLocales, 'en')) {
            graphqlLocales.push('en');
          }

          setGraphqlTenantLocales(graphqlLocales);
        } else {
          setGraphqlTenantLocales(currentTenant);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return !isNilOrError(graphqlTenantLocales) ? graphqlTenantLocales : ['en'];
}
