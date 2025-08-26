import React, { useCallback, useEffect, useState } from 'react';

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
  const [initialLocaleSet, setInitialLocaleSet] = useState(false);
  const [messages, setMessages] = useState<AllMessages>({} as AllMessages);
  const [intlShapes, setIntlShapes] = useState<IntlShapes>({} as IntlShapes);
  const tenantLocales = useAppConfigurationLocales();
  const [locale, setLocale] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    const sub = localeStream().observable.subscribe(async (locale) => {
      await loadLocale(locale);
      setLocale(locale);
    });

    return () => sub.unsubscribe();
  });

  const loadLocale = useCallback(
    async (locale: SupportedLocale) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!messages[locale] && messagesGlob[`/i18n/${locale}.ts`]) {
        const module = await messagesGlob[`/i18n/${locale}.ts`]();
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
      }
    },
    [messages]
  );

  const loadLocales = useCallback(async () => {
    if (!tenantLocales) return;

    const promises = tenantLocales.map((locale) => {
      return loadLocale(locale);
    });

    await Promise.all(promises);
  }, [tenantLocales, loadLocale]);

  useEffect(() => {
    if (initialLocaleSet) return;
    if (!tenantLocales) return;
    if (!locale) return;
    if (!tenantLocales.includes(locale)) return;

    loadLocale(locale);
    setInitialLocaleSet(true);
  }, [tenantLocales, locale, messages, loadLocale, initialLocaleSet]);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (locale && messages[locale]) {
    return (
      <CustomIntlContext.Provider value={{ intlShapes, loadLocales }}>
        <IntlProvider locale={locale} key={locale} messages={messages[locale]}>
          {React.Children.only(children)}
        </IntlProvider>
      </CustomIntlContext.Provider>
    );
  }

  return null;
};

export default LanguageProvider;
