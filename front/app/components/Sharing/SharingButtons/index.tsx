import React, { memo } from 'react';

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
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// utils
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder';
  url: string;
  twitterMessage: string;
  facebookMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams: UtmParams;
  id?: string;
}

const SharingButtons = memo(
  ({
    context,
    twitterMessage,
    whatsAppMessage,
    facebookMessage,
    emailSubject,
    emailBody,
    id,
    url,
    utmParams,
  }: Props & WrappedComponentProps) => {
    const maxTabletOrSmaller = useBreakpoint('tablet');

    const getUrl = (medium: Medium) => {
      return getUrlWithUtm(medium, url, utmParams);
    };
    const titleMessage = {
      idea: <FormattedMessage {...messages.share} />,
      project: <FormattedMessage {...messages.shareThisProject} />,
      initiative: <FormattedMessage {...messages.shareThisInitiative} />,
      folder: <FormattedMessage {...messages.shareThisFolder} />,
    }[context];

    return (
      <>
        <Title
          textAlign={maxTabletOrSmaller ? 'center' : 'inherit'}
          mb="12px"
          color="textPrimary"
          variant="h3"
        >
          {titleMessage}
        </Title>
        <Box
          id={id}
          justifyContent={maxTabletOrSmaller ? 'center' : 'flex-start'}
          display="flex"
          gap="5px"
          flexWrap="wrap"
        >
          <Facebook
            facebookMessage={facebookMessage}
            url={getUrl('facebook')}
          />
          {maxTabletOrSmaller && <Messenger url={getUrl('messenger')} />}
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
          <CopyLink copyLink={url} />
        </Box>
      </>
    );
  }
);

export default injectIntl(SharingButtons);
