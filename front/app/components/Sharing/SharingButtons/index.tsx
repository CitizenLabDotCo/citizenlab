import React from 'react';

import {
  Box,
  BoxFlexProps,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { FormattedMessage } from 'utils/cl-intl';

import CopyLink from '../buttons/CopyLink';
import Email from '../buttons/Email';
import Facebook from '../buttons/Facebook';
import Messenger from '../buttons/Messenger';
import Twitter from '../buttons/Twitter';
import WhatsApp from '../buttons/WhatsApp';
import messages from '../messages';
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

interface Props {
  context: 'idea' | 'project' | 'folder' | 'event';
  url: string;
  twitterMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams: UtmParams;
  id?: string;
  hideTitle?: boolean;
  justifyContent?: BoxFlexProps['justifyContent'];
}

const SharingButtons = ({
  context,
  twitterMessage,
  whatsAppMessage,
  emailSubject,
  emailBody,
  id,
  url,
  utmParams,
  hideTitle,
  justifyContent,
}: Props) => {
  const [searchParams] = useSearchParams();
  const phaseContext = searchParams.get('phase_context');
  const { data: appConfiguration } = useAppConfiguration();
  const isSharingEnabled =
    appConfiguration?.data.attributes.settings.core.allow_sharing;

  const isSmallerThanTablet = useBreakpoint('tablet');

  const getUrl = (medium: Medium) => {
    return getUrlWithUtm(medium, url, utmParams);
  };
  const titleMessage = {
    idea: <FormattedMessage {...messages.share} />,
    project: <FormattedMessage {...messages.shareThisProject} />,
    folder: <FormattedMessage {...messages.shareThisFolder} />,
    event: <FormattedMessage {...messages.shareThisEvent} />,
  }[context];

  const addPhaseContext = (url: string) => {
    const hasExistingParams = url.indexOf('?') >= 0;
    if (phaseContext) {
      if (hasExistingParams) {
        return `${url}&phase_context=${phaseContext}`;
      } else {
        return `${url}?phase_context=${phaseContext}`;
      }
    }
    return url;
  };

  if (!isSharingEnabled) {
    return null;
  }

  return (
    <>
      {!hideTitle && (
        <Title
          textAlign={isSmallerThanTablet ? 'center' : 'inherit'}
          mb="20px"
          color="textPrimary"
          variant="h3"
          as="h2"
        >
          {titleMessage}
        </Title>
      )}
      <Box
        id={id}
        alignItems={isSmallerThanTablet ? 'center' : 'flex-start'}
        display="flex"
        gap="5px"
        flexWrap="wrap"
        flexDirection={isSmallerThanTablet ? 'column' : 'row'}
        justifyContent={justifyContent}
      >
        <Box display="flex" gap="4px">
          <Facebook url={getUrl('facebook')} />
          {isSmallerThanTablet && (
            <Messenger url={addPhaseContext(getUrl('messenger'))} />
          )}
          <WhatsApp
            whatsAppMessage={whatsAppMessage}
            url={getUrl('whatsapp')}
          />
          <Twitter
            twitterMessage={twitterMessage}
            url={addPhaseContext(getUrl('twitter'))}
          />
          <Email
            emailSubject={emailSubject}
            emailBody={emailBody}
            isDropdownStyle={false}
          />
        </Box>
        {isSmallerThanTablet && (
          <Box justifyContent="center">
            <FormattedMessage {...messages.or} />
          </Box>
        )}
        <CopyLink copyLink={addPhaseContext(url)} />
      </Box>
    </>
  );
};

export default SharingButtons;
