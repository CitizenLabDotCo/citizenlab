import { useCallback } from 'react';
import {
  // eslint-disable-next-line no-restricted-imports
  useIntl as useOriginalUseIntl,
  MessageDescriptor,
} from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

const useIntl = () => {
  const intl = useOriginalUseIntl();
  const localize = useLocalize();
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
          ? localize(appConfig.data.attributes.settings.core.organization_name)
          : undefined,
        orgType: !isNilOrError(appConfig)
          ? appConfig.data.attributes.settings.core.organization_type
          : undefined,
        ...(values || {}),
      });
    },
    [intl, localize, appConfig]
  );

  return { ...intl, formatMessage: formatMessageReplacement };
};

export default useIntl;
