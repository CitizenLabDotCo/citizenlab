import React, { useEffect, useState } from 'react';

import { IntlProvider, createIntlCache, createIntl } from 'react-intl';
import { Locale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { localeStream } from 'utils/localeStream';

import CustomIntlContext from './CustomIntlContext';
import { AllMessages, IntlShapes } from './types';

interface Props {
  children: React.ReactNode;
  locale: Locale;
  tenantLocales: Locale[];
}

const LanguageProvider = ({ children, locale, tenantLocales }: Props) => {
  const [messages, setMessages] = useState<AllMessages>({} as AllMessages);
  const [intlShapes, setIntlShapes] = useState<IntlShapes>({} as IntlShapes);

  useEffect(() => {
    for (const locale of tenantLocales) {
      if (!messages[locale]) {
        import(`i18n/${locale}`).then((translationMessages) => {
          const intlCache = createIntlCache();

          const intlShape = createIntl(
            {
              locale,
              messages: translationMessages.default,
            },
            intlCache
          );

          setMessages((prevState) => ({
            ...prevState,
            [locale]: translationMessages.default,
          }));
          setIntlShapes((prevState) => ({
            ...prevState,
            [locale]: intlShape,
          }));
        });
      }
    }
  }, [tenantLocales, messages]);

  if (locale && messages[locale]) {
    return (
      <CustomIntlContext.Provider value={intlShapes}>
        <IntlProvider locale={locale} key={locale} messages={messages[locale]}>
          {React.Children.only(children)}
        </IntlProvider>
      </CustomIntlContext.Provider>
    );
  }

  return null;
};

export default ({ children }: { children: React.ReactNode }) => {
  const tenantLocales = useAppConfigurationLocales();
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    const sub = localeStream().observable.subscribe((locale) => {
      setLocale(locale);
    });

    return () => sub.unsubscribe();
  });

  if (!locale || !tenantLocales) return null;

  return (
    <LanguageProvider locale={locale} tenantLocales={tenantLocales}>
      {children}
    </LanguageProvider>
  );
};
