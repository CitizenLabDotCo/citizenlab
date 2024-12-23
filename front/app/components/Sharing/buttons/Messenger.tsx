import React from 'react';

import { Button, colors } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import tracks from '../tracks';
import { clickSocialSharingLink, Medium } from '../utils';
interface Props {
  className?: string;
  url: string;
}
const Messenger = ({
  url,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: appConfig } = useAppConfiguration();
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('messenger');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked, properties);
  };
  if (!isNilOrError(appConfig)) {
    const facebookAppId =
      appConfig.data.attributes.settings.facebook_login?.app_id;
    const messengerHref = facebookAppId
      ? `fb-messenger://share/?link=${url}&app_id=${facebookAppId}`
      : null;

    if (messengerHref) {
      return (
        <Button
          onClick={handleClick(messengerHref)}
          aria-label={formatMessage(messages.shareViaMessenger)}
          bgColor={colors.facebookMessenger}
          width="40px"
          height="40px"
          icon="facebook-messenger"
          iconSize="20px"
        />
      );
    }
  }

  return null;
};

export default injectIntl(Messenger);
