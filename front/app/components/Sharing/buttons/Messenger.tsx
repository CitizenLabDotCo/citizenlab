import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { clickSocialSharingLink, Medium } from '../utils';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';
import { Button } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
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
    trackEventByName(tracks.shareButtonClicked.name, properties);
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
