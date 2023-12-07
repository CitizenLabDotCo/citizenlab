import { useContext, useCallback } from 'react';

// context
import CustomIntlContext from 'containers/LanguageProvider/CustomIntlContext';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { handleFormatMessage, FormatMessageValues } from './useIntl';

// typings
import { Locale } from 'typings';
import { MessageDescriptor } from 'react-intl';

const useFormatMessageWithLocale = () => {
  const intlShapes = useContext(CustomIntlContext);
  const { data: appConfig } = useAppConfiguration();

  const formatMessageWithLocale = useCallback(
    (
      locale: Locale,
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
