import { useContext, useCallback } from 'react';

import { MessageDescriptor } from 'react-intl';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import CustomIntlContext from 'containers/LanguageProvider/CustomIntlContext';

import { handleFormatMessage, FormatMessageValues } from './useIntl';

const useFormatMessageWithLocale = () => {
  const intlShapes = useContext(CustomIntlContext);
  const { data: appConfig } = useAppConfiguration();

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

  return formatMessageWithLocale;
};

export default useFormatMessageWithLocale;
