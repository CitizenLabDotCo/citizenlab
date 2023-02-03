import React from 'react';
import { clickSocialSharingLink, Medium } from '../utils';

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
  whatsAppMessage: string;
  url: string;
}

const WhatsApp = ({
  whatsAppMessage,
  url,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('whatsapp');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  const whatsAppSharingText = encodeURIComponent(whatsAppMessage).concat(
    ' ',
    url
  );
  const whatsAppHref = `https://api.whatsapp.com/send?phone=&text=${whatsAppSharingText}`;

  return (
    <Button
      onClick={handleClick(whatsAppHref)}
      aria-label={formatMessage(messages.shareViaWhatsApp)}
      bgColor={colors.success}
      width="40px"
      height="40px"
      icon="whatsapp"
      iconSize="20px"
      justify="center"
    />
  );
};

export default injectIntl(WhatsApp);
