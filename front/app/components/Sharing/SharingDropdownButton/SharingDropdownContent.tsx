import React from 'react';
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

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
import { useBreakpoint } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .sharingButton {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;
    text-align: left;
    color: ${colors.label};
    font-size: ${fontSizes.base}px;

    &:hover {
      background-color: ${darken(0.06, 'white')};
    }

    &.messenger {
      ${media.biggerThanMaxTablet`
        display: none;
      `}
    }
  }
`;

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
    <Container id={id} className={className || ''}>
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
    </Container>
  );
};

export default injectIntl(SharingDropdownContent);
