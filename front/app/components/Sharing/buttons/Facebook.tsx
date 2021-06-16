import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { FacebookButton } from 'react-social';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
  onClick: () => void;
  children: JSX.Element | JSX.Element[];
  url: string;
}

const Facebook = ({
  children,
  onClick,
  className,
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useAppConfiguration();

  const handleClick = () => {
    onClick();
  };

  if (!isNilOrError(tenant)) {
    const facebookConfig = tenant.data.attributes.settings?.facebook_login;

    if (facebookConfig?.allowed && facebookConfig?.app_id) {
      return (
        <FacebookButton
          appId={facebookConfig.app_id}
          url={url}
          className={className}
          onClick={handleClick}
          sharer={true}
          aria-label={formatMessage(messages.shareOnFacebook)}
        >
          {children}
        </FacebookButton>
      );
    }
  }

  return null;
};

export default injectIntl(Facebook);
