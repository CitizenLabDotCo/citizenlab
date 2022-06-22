import React from 'react';
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

// components
import Facebook from '../buttons/Facebook';
import Twitter from '../buttons/Twitter';
import Messenger from '../buttons/Messenger';
import WhatsApp from '../buttons/WhatsApp';
import Email from '../buttons/Email';
import CopyLink from '../buttons/CopyLink';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

interface Props {
  className?: string;
  url: string;
  twitterMessage: string;
  whatsAppMessage: string;
  facebookMessage: string;
  emailSubject: string;
  emailBody: string;
  utmParams: UtmParams;
  id?: string;
}

const SharingDropdownContent = ({
  id,
  url,
  className,
  utmParams,
  emailBody,
  emailSubject,
  twitterMessage,
  whatsAppMessage,
  facebookMessage,
}: Props & InjectedIntlProps) => {
  const maxTabletOrSmaller = useBreakpoint('largeTablet');
  const getUrl = (medium: Medium) => {
    return getUrlWithUtm(medium, url, utmParams);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      id={id}
      className={className || ''}
    >
      <Facebook
        facebookMessage={facebookMessage}
        url={getUrl('facebook')}
        isInModal={false}
        isDropdownStyle={true}
      />
      {maxTabletOrSmaller && (
        <Messenger
          isDropdownStyle={true}
          isInModal={false}
          url={getUrl('messenger')}
        />
      )}
      <WhatsApp
        url={getUrl('whatsapp')}
        whatsAppMessage={whatsAppMessage}
        isInModal={false}
        isDropdownStyle={true}
      />
      <Twitter
        isInModal={false}
        twitterMessage={twitterMessage}
        url={getUrl('twitter')}
        isDropdownStyle={true}
      />
      <Email
        emailBody={emailBody}
        emailSubject={emailSubject}
        isDropdownStyle={true}
        isInModal={false}
      />
      <CopyLink isDropdownStyle={true} copyLink={url} />
    </Box>
  );
};

export default injectIntl(SharingDropdownContent);
