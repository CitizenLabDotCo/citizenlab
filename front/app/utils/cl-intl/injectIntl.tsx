import React from 'react';
import { useIntl, MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

function buildComponent<P>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const locale = useLocale();
    const localize = useLocalize();
    const appConfig = useAppConfiguration();
    const intl = useIntl();

    if (isNilOrError(appConfig) || isNilOrError(locale)) return null;

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

    return <Component {...props} intl={intlReplacement} />;
  };
}

export default function injectIntl<P>(
  component: React.ComponentType<P & WrappedComponentProps>
) {
  return buildComponent<P & WrappedComponentProps>(component);
}
