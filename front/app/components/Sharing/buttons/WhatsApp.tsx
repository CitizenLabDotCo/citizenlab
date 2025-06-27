import React from 'react';

import { Button, colors } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';
import { clickSocialSharingLink, Medium } from '../utils';

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
    trackEventByName(tracks.shareButtonClicked, properties);
  };

  const whatsAppSharingText = encodeURIComponent(whatsAppMessage).concat(
    ' ',
    url
  );
  const whatsAppHref = `https://api.whatsapp.com/send?phone=&text=${whatsAppSharingText}`;

  return (
    <Button
      onClick={handleClick(whatsAppHref)}
      ariaLabel={formatMessage(messages.shareViaWhatsApp)}
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
