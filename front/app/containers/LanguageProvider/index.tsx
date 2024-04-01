import React, { useEffect, useState } from 'react';

import { IntlProvider, createIntlCache, createIntl } from 'react-intl';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { localeStream } from 'utils/localeStream';

import CustomIntlContext from './CustomIntlContext';
import { AllMessages, IntlShapes } from './types';

interface Props {
  children: React.ReactNode;
}

const locale$ = localeStream().observable;

const LanguageProvider = ({ children }: Props) => {
  const tenantLocales = useAppConfigurationLocales();
  const [messages, setMessages] = useState<AllMessages>({} as AllMessages);
  const [intlShapes, setIntlShapes] = useState<IntlShapes>({} as IntlShapes);
  const [locale, setLocale] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    const sub = locale$.subscribe((locale) => {
      setLocale(locale);
    });

    return () => sub.unsubscribe();
  });

  useEffect(() => {
    if (tenantLocales) {
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

export default LanguageProvider;
