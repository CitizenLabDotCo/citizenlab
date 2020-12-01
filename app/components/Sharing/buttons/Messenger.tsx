import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { clickSocialSharingLink } from '../utils';

// hooks
import useTenant from 'hooks/useTenant';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
  children: JSX.Element | JSX.Element[];
  onClick: () => void;
  url: string;
}
const Messenger = ({
  children,
  className,
  onClick,
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useTenant();
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    onClick();
  };

  if (!isNilOrError(tenant)) {
    const facebookAppId =
      tenant.data.attributes.settings.facebook_login?.app_id;
    const messengerHref = facebookAppId
      ? `fb-messenger://share/?link=${url}&app_id=${facebookAppId}`
      : null;

    if (messengerHref) {
      return (
        <button
          className={className}
          onClick={handleClick(messengerHref)}
          aria-label={formatMessage(messages.shareViaMessenger)}
        >
          {children}
        </button>
      );
    }
  }

  return null;
};

export default injectIntl(Messenger);
