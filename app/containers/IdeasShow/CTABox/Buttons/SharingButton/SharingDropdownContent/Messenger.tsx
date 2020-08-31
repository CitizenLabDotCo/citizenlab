import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import useTenant from 'hooks/useTenant';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  url: string;
}

const handleClick = (_event) => {
  trackClickByEventName(tracks.clickMessengerShare.name);
};

const Messenger = ({
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const facebookAppId =
      tenant.data.attributes.settings.facebook_login?.app_id;

    return (
      <a
        className="sharingButton messenger"
        href={`fb-messenger://share/?link=${encodeURIComponent(
          url
        )}&app_id=${facebookAppId}`}
        onClick={handleClick}
        role="button"
        aria-label={formatMessage(messages.shareViaMessenger)}
      >
        {'Messenger'}
      </a>
    );
  }

  return null;
};

export default injectIntl(Messenger);
