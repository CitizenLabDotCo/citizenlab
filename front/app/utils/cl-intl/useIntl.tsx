import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';
import { useCallback } from 'react';
import {
  MessageDescriptor,
  // eslint-disable-next-line no-restricted-imports
  useIntl as useOriginalUseIntl,
} from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

const useIntl = () => {
  const intl = useOriginalUseIntl();
  const localize = useLocalize();
  const appConfig = useAppConfiguration();

  const formatMessageReplacement = useCallback(
    (
      messageDescriptor: MessageDescriptor,
      values?: { [key: string]: string | number | boolean | Date } | undefined
    ) => {
      return intl.formatMessage(messageDescriptor, {
        tenantName: !isNilOrError(appConfig)
          ? appConfig.attributes.name
          : undefined,
        orgName: !isNilOrError(appConfig)
          ? localize(appConfig.attributes.settings.core.organization_name)
          : undefined,
        orgType: !isNilOrError(appConfig)
          ? appConfig.attributes.settings.core.organization_type
          : undefined,
        ...(values || {}),
      });
    },
    [intl, localize, appConfig]
  );

  return { ...intl, formatMessage: formatMessageReplacement };
};

export default useIntl;
