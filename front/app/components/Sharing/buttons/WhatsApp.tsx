import React from 'react';
import { clickSocialSharingLink, Medium } from '../utils';

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
  whatsAppMessage: string;
  url: string;
  isDropdownStyle: boolean;
  isInModal: boolean | undefined;
}

const WhatsApp = ({
  whatsAppMessage,
  url,
  isDropdownStyle,
  isInModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('whatsapp');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  const whatsAppSharingText = encodeURIComponent(whatsAppMessage).concat(
    ' ',
    url
  );
  const whatsAppHref = `https://api.whatsapp.com/send?phone=&text=${whatsAppSharingText}`;

  return (
    <Box
      mr={isDropdownStyle ? '0px' : '5px'}
      onClick={trackClick('email')}
      flex="1 1 1"
      display="flex"
      style={{ cursor: 'pointer' }}
    >
      <Button
        onClick={handleClick(whatsAppHref)}
        aria-label={formatMessage(messages.shareViaWhatsApp)}
        bgColor={isDropdownStyle ? '#fff' : colors.whatsapp}
        width="100%"
        icon="whatsapp"
        iconColor={isDropdownStyle ? colors.whatsapp : '#fff'}
        iconSize="20px"
        text={
          isDropdownStyle ? (
            <FormattedMessage {...messages.whatsapp} />
          ) : undefined
        }
        textColor={colors.grey}
        textHoverColor={isDropdownStyle ? colors.grey : '#fff'}
        iconHoverColor={isDropdownStyle ? colors.whatsapp : '#fff'}
        justify={isDropdownStyle ? 'left' : 'center'}
        bgHoverColor={
          isDropdownStyle ? darken(0.06, '#fff') : darken(0.06, colors.whatsapp)
        }
      />
    </Box>
  );
};

export default injectIntl(WhatsApp);
