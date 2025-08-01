import { useState, useContext, useCallback, useEffect } from 'react';

import { MessageDescriptor } from 'react-intl';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import CustomIntlContext from 'containers/LanguageProvider/CustomIntlContext';

import { handleFormatMessage, FormatMessageValues } from './useIntl';

const useFormatMessageWithLocale = () => {
  const [localesLoaded, setLocalesLoaded] = useState(false);
  const { intlShapes, loadLocales } = useContext(CustomIntlContext);
  const { data: appConfig } = useAppConfiguration();

  useEffect(() => {
    if (localesLoaded) return;
    loadLocales().then(() => {
      setLocalesLoaded(true);
    });
  }, [loadLocales, localesLoaded]);

  const formatMessageWithLocale = useCallback(
    (
      locale: SupportedLocale,
      messageDescriptor: MessageDescriptor,
      values?: FormatMessageValues
    ) => {
      return handleFormatMessage(
        intlShapes[locale],
        appConfig,
        locale,
        messageDescriptor,
        values
      );
    },
    [intlShapes, appConfig]
  );

  if (!localesLoaded) return undefined;

  return formatMessageWithLocale;
};

export default useFormatMessageWithLocale;
