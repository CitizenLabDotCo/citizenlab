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
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// style
import { useTheme } from 'styled-components';

// utils
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder';
  isInModal?: boolean;
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
    isInModal,
    id,
    url,
    utmParams,
  }: Props & InjectedIntlProps) => {
    const maxTabletOrSmaller = useBreakpoint('largeTablet');
    const theme: any = useTheme();

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
        <Title mb="12px" color={theme.colorText} variant="h3" as="h1">
          {titleMessage}
        </Title>
        <Box
          id={id}
          justifyContent={maxTabletOrSmaller ? 'center' : 'flex-start'}
          display="flex"
          gap="5px"
          flexWrap={maxTabletOrSmaller ? 'wrap' : 'nowrap'}
        >
          <Facebook
            facebookMessage={facebookMessage}
            url={getUrl('facebook')}
            isDropdownStyle={false}
            isInModal={isInModal}
          />
          {maxTabletOrSmaller && (
            <Messenger
              isInModal={isInModal}
              isDropdownStyle={false}
              url={getUrl('messenger')}
            />
          )}
          <WhatsApp
            whatsAppMessage={whatsAppMessage}
            url={getUrl('whatsapp')}
            isInModal={isInModal}
            isDropdownStyle={false}
          />
          <Twitter
            twitterMessage={twitterMessage}
            url={getUrl('twitter')}
            isDropdownStyle={false}
            isInModal={isInModal}
          />
          <Email
            isInModal={isInModal}
            emailSubject={emailSubject}
            emailBody={emailBody}
            isDropdownStyle={false}
          />
          <CopyLink isDropdownStyle={false} copyLink={url} />
        </Box>
      </>
    );
  }
);

export default injectIntl(SharingButtons);
