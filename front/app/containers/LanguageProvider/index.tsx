import React, { useEffect, useState } from 'react';

import { IntlProvider, createIntlCache, createIntl } from 'react-intl';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { localeStream } from 'utils/localeStream';

import CustomIntlContext from './CustomIntlContext';
import { AllMessages, IntlShapes } from './types';

type TranslationModule = { default: Record<string, string> };

const messagesGlob: Record<string, () => Promise<TranslationModule>> =
  import.meta.glob('/i18n/*.ts') as Record<
    string,
    () => Promise<TranslationModule>
  >;

interface Props {
  children: React.ReactNode;
}

const LanguageProvider = ({ children }: Props) => {
  const [messages, setMessages] = useState<AllMessages>({} as AllMessages);
  const [intlShapes, setIntlShapes] = useState<IntlShapes>({} as IntlShapes);
  const tenantLocales = useAppConfigurationLocales();
  const [locale, setLocale] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    const sub = localeStream().observable.subscribe((locale) => {
      setLocale(locale);
    });

    return () => sub.unsubscribe();
  });

  useEffect(() => {
    if (!tenantLocales) return;

    for (const locale of tenantLocales) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!messages[locale] && messagesGlob[`/i18n/${locale}.ts`]) {
        messagesGlob[`/i18n/${locale}.ts`]().then((module) => {
          const intlCache = createIntlCache();

          const intlShape = createIntl(
            {
              locale,
              messages: module.default,
            },
            intlCache
          );

          setMessages((prevState) => ({
            ...prevState,
            [locale]: module.default,
          }));
          setIntlShapes((prevState) => ({
            ...prevState,
            [locale]: intlShape,
          }));
        });
      }
    }
  }, [tenantLocales, messages]);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
