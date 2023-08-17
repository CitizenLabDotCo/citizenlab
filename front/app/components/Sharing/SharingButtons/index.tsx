import React from 'react';

// components
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import Facebook from '../buttons/Facebook';
import Twitter from '../buttons/Twitter';
import Messenger from '../buttons/Messenger';
import WhatsApp from '../buttons/WhatsApp';
import Email from '../buttons/Email';
import CopyLink from '../buttons/CopyLink';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder' | 'event';
  url: string;
  twitterMessage: string;
  facebookMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams: UtmParams;
  id?: string;
}

const SharingButtons = ({
  context,
  twitterMessage,
  whatsAppMessage,
  facebookMessage,
  emailSubject,
  emailBody,
  id,
  url,
  utmParams,
}: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');

  const getUrl = (medium: Medium) => {
    return getUrlWithUtm(medium, url, utmParams);
  };
  const titleMessage = {
    idea: <FormattedMessage {...messages.share} />,
    project: <FormattedMessage {...messages.shareThisProject} />,
    initiative: <FormattedMessage {...messages.shareThisInitiative} />,
    folder: <FormattedMessage {...messages.shareThisFolder} />,
    event: <FormattedMessage {...messages.shareThisEvent} />,
  }[context];

  return (
    <>
      <Title
        textAlign={'center'}
        mb="20px"
        color="textPrimary"
        variant="h3"
        as="h2"
      >
        {titleMessage}
      </Title>
      <Box
        id={id}
        alignItems={'center'}
        display="flex"
        gap="5px"
        flexWrap="wrap"
        flexDirection="column"
      >
        <Box display="flex" gap="4px">
          <Facebook
            facebookMessage={facebookMessage}
            url={getUrl('facebook')}
          />
          {isSmallerThanTablet && <Messenger url={getUrl('messenger')} />}
          <WhatsApp
            whatsAppMessage={whatsAppMessage}
            url={getUrl('whatsapp')}
          />
          <Twitter twitterMessage={twitterMessage} url={getUrl('twitter')} />
          <Email
            emailSubject={emailSubject}
            emailBody={emailBody}
            isDropdownStyle={false}
          />
        </Box>
        <Box justifyContent="center">
          <FormattedMessage {...messages.or} />
        </Box>
        <CopyLink copyLink={url} />
      </Box>
    </>
  );
};

export default SharingButtons;
