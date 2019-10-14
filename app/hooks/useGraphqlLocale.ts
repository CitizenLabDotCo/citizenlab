import { useState, useEffect } from 'react';
import { localeStream } from 'services/locale';
import { isNilOrError, convertToGraphqlLocale } from 'utils/helperUtils';
import { GraphqlLocale } from 'typings';

export default function useGraphqlLocale() {
  const [graphqlLocale, setGraphqlLocale] = useState<GraphqlLocale | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = localeStream().observable.subscribe((locale) => {
      setGraphqlLocale(!isNilOrError(locale) ? convertToGraphqlLocale(locale) : locale);
    });

    return () => subscription.unsubscribe();
  }, []);

  return graphqlLocale;
}
