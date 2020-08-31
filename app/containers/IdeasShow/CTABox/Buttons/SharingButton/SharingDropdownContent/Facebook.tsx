import React from 'react';
import { FacebookButton } from 'react-social';
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

const Facebook = ({
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const facebookAppId =
      tenant.data.attributes.settings.facebook_login?.app_id;

    return (
      <FacebookButton
        appId={facebookAppId}
        url={url}
        className="sharingButton facebook first"
        sharer={true}
        onClick={trackClickByEventName(tracks.clickFbShare.name)}
        aria-label={formatMessage(messages.shareOnFacebook)}
      >
        {/* <StyledIcon name="facebook" /> */}
      </FacebookButton>
    );
  }

  return null;
};

export default injectIntl(Facebook);
