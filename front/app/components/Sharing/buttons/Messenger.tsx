import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Button } from '@citizenlab/cl2-component-library';
// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import { clickSocialSharingLink, Medium } from '../utils';
// analytics
import { trackEventByName } from 'utils/analytics';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
// style
import { colors } from 'utils/styleUtils';
import messages from '../messages';
import tracks from '../tracks';

interface Props {
  className?: string;
  url: string;
}
const Messenger = ({
  url,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const appConfig = useAppConfiguration();
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('messenger');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked.name, properties);
  };
  if (!isNilOrError(appConfig)) {
    const facebookAppId = appConfig.attributes.settings.facebook_login?.app_id;
    const messengerHref = facebookAppId
      ? `fb-messenger://share/?link=${url}&app_id=${facebookAppId}`
      : null;

    if (messengerHref) {
      return (
        <Button
          onClick={handleClick(messengerHref)}
          aria-label={formatMessage(messages.shareViaWhatsApp)}
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
