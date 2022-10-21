import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useIntl, MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

const injectIntl = <P extends WrappedComponentProps>(
  Component: React.ComponentType<P>
) => {
  return (props: Omit<P, keyof WrappedComponentProps>) => {
    const localize = useLocalize();
    const appConfig = useAppConfiguration();
    const intl = useIntl();

    if (isNilOrError(appConfig)) return null;

    const formatMessageReplacement = (
      messageDescriptor: MessageDescriptor,
      values?: { [key: string]: string | number | boolean | Date } | undefined
    ) => {
      return intl.formatMessage(messageDescriptor, {
        tenantName: appConfig.attributes.name,
        orgName: localize(appConfig.attributes.settings.core.organization_name),
        orgType: appConfig.attributes.settings.core.organization_type,
        ...(values || {}),
      });
    };

    const intlReplacement = {
      ...intl,
      formatMessage: formatMessageReplacement,
    };

    return <Component {...(props as P)} intl={intlReplacement} />;
  };
};

/** @deprecated Use useIntl instead. */
export default injectIntl;
