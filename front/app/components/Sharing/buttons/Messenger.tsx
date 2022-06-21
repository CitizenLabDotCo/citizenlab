import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { clickSocialSharingLink, Medium } from '../utils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Box, Button } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
interface Props {
  className?: string;
  url: string;
  isDropdownStyle: boolean;
  isInModal: boolean | undefined;
}
const Messenger = ({
  isInModal,
  isDropdownStyle,
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useAppConfiguration();
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('messenger');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };
  if (!isNilOrError(tenant)) {
    const facebookAppId =
      tenant.data.attributes.settings.facebook_login?.app_id;
    const messengerHref = facebookAppId
      ? `fb-messenger://share/?link=${url}&app_id=${facebookAppId}`
      : null;

    if (messengerHref) {
      return (
        <Box flex="1 1 1" display="flex" style={{ cursor: 'pointer' }}>
          <Button
            onClick={handleClick(messengerHref)}
            aria-label={formatMessage(messages.shareViaWhatsApp)}
            bgColor={isDropdownStyle ? '#fff' : colors.facebookMessenger}
            width="100%"
            icon="messenger"
            iconColor={isDropdownStyle ? colors.facebookMessenger : '#fff'}
            iconSize="20px"
            text={
              isDropdownStyle ? (
                <FormattedMessage {...messages.messenger} />
              ) : undefined
            }
            textColor={colors.grey}
            textHoverColor={isDropdownStyle ? colors.grey : '#fff'}
            iconHoverColor={isDropdownStyle ? colors.facebookMessenger : '#fff'}
            justify={isDropdownStyle ? 'left' : 'center'}
            bgHoverColor={
              isDropdownStyle
                ? darken(0.06, '#fff')
                : darken(0.06, colors.facebookMessenger)
            }
          />
        </Box>
      );
    }
  }

  return null;
};

export default injectIntl(Messenger);
