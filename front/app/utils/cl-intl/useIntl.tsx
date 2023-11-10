import { useCallback, useState, useEffect } from 'react';
import {
  // eslint-disable-next-line no-restricted-imports
  useIntl as useOriginalUseIntl,
  MessageDescriptor,
} from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { localeStream } from 'utils/locale';
import { getLocalizedWithFallback } from 'utils/i18n';
import { Locale } from 'typings';

const useIntl = () => {
  const intl = useOriginalUseIntl();
  const [locale, setLocale] = useState<Locale | undefined>(undefined);

  useEffect(() => {
    const subscription = localeStream().observable.subscribe((locale) => {
      setLocale(locale);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: appConfig } = useAppConfiguration();

  const formatMessageReplacement = useCallback(
    (
      messageDescriptor: MessageDescriptor,
      values?: { [key: string]: string | number | boolean | Date } | undefined
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
    },
    [intl, appConfig, locale]
  );

  return { ...intl, formatMessage: formatMessageReplacement };
};

export default useIntl;
