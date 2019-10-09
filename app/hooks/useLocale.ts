import { useState, useEffect } from 'react';
import { localeStream } from 'services/locale';
import { Locale } from 'typings';

export default function useLocale() {
  const [locale, setLocale] = useState<Locale | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = localeStream().observable.subscribe((locale) => {
      setLocale(locale);
    });

    return () => subscription.unsubscribe();
  }, []);

  return locale;
}
