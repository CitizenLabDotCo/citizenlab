import React from 'react';
import { useIntl, MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

export default function injectIntl<Props>(
  Component: React.ComponentType<Props>
) {
  return (props: Props) => {
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
        orgName: localize(appConfig.attributes.settings.core.organization_name),
        ...(values || {}),
      });
    };

    const intlReplacement = {
      ...intl,
      formatMessage: formatMessageReplacement,
    };

    const propsWithIntl: Props = {
      ...props,
      intl
    };

    return <Component {...propsWithIntl} />;
  };
}
