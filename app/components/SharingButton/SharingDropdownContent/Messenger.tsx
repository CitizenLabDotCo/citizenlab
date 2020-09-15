import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import useTenant from 'hooks/useTenant';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';

const StyledIcon = styled(Icon)`
  width: 22px;
  height: 18px;
  margin-right: 10px;
  fill: rgba(0, 120, 255, 1);
`;

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
        <StyledIcon name="messenger" />
        {'Messenger'}
      </a>
    );
  }

  return null;
};

export default injectIntl(Messenger);
