import { useCallback, useState, useEffect } from 'react';

import {
  // eslint-disable-next-line no-restricted-imports
  useIntl as useOriginalUseIntl,
  MessageDescriptor,
  IntlShape,
} from 'react-intl';
import { SupportedLocale } from 'typings';

import { IAppConfiguration } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { isNilOrError } from 'utils/helperUtils';
import { getLocalizedWithFallback } from 'utils/i18n';
import { localeStream } from 'utils/localeStream';

export type FormatMessageValues =
  | { [key: string]: string | number | boolean | Date }
  | undefined;

export const handleFormatMessage = (
  intl: IntlShape,
  appConfig: IAppConfiguration | undefined,
  locale: SupportedLocale | undefined,
  messageDescriptor: MessageDescriptor,
  values?: FormatMessageValues
) => {
  return intl.formatMessage(messageDescriptor, {
    tenantName: !isNilOrError(appConfig)
      ? appConfig.data.attributes.name
      : undefined,
    orgName: !isNilOrError(appConfig)
      ? getLocalizedWithFallback(
          appConfig.data.attributes.settings.core.organization_name,
          locale,
          appConfig.data.attributes.settings.core.locales
        )
      : undefined,
    orgType: !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings.core.organization_type
      : undefined,
    ...(values || {}),
  });
};

const useIntl = () => {
  const intl = useOriginalUseIntl();
  const [locale, setLocale] = useState<SupportedLocale | undefined>(undefined);

  useEffect(() => {
    const subscription = localeStream().observable.subscribe((locale) => {
      setLocale(locale);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: appConfig } = useAppConfiguration();

  const formatMessageReplacement = useCallback(
    (messageDescriptor: MessageDescriptor, values?: FormatMessageValues) => {
      return handleFormatMessage(
        intl,
        appConfig,
        locale,
        messageDescriptor,
        values
      );
    },
    [intl, appConfig, locale]
  );

  return { ...intl, formatMessage: formatMessageReplacement };
};

export default useIntl;
