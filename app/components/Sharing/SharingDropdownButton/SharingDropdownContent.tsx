import React from 'react';
import tracks from '../tracks';
import { getUrlWithUtm, UtmParams, Medium } from '../';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import { Icon } from 'cl2-component-library';
import Facebook from '../Facebook';
import Twitter from '../Twitter';
import Messenger from '../Messenger';
import WhatsApp from '../WhatsApp';
import Email from '../Email';

// tracking
import { trackEventByName } from 'utils/analytics';

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

const FacebookIcon = styled(Icon)`
  width: 22px;
  height: 18px;
  margin-right: 10px;
  fill: #3c5a99;
`;

const MessengerIcon = styled(Icon)`
  width: 22px;
  height: 18px;
  margin-right: 10px;
  fill: rgba(0, 120, 255, 1);
`;

const WhatsAppIcon = styled(Icon)`
  width: 22px;
  height: 22px;
  fill: #23b43a;
  margin-right: 10px;
`;

const TwitterIcon = styled(Icon)`
  width: 22px;
  height: 17px;
  fill: #1da1f2;
  margin-right: 10px;
`;

const EmailIcon = styled(Icon)`
  margin-right: 10px;
  width: 22px;
  height: 17px;
  fill: ${colors.secondaryText};
`;

interface Props {
  className?: string;
  url: string;
  twitterMessage: string;
  whatsAppMessage: string;
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
}: Props) => {
  const getUrl = (medium: Medium) => {
    return getUrlWithUtm(medium, url, utmParams);
  };

  const facebookClick = () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: 'facebook' });
  };

  const messengerClick = () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: 'messenger' });
  };

  const whatsAppClick = () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: 'whatsapp' });
  };

  const twitterClick = () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: 'twitter' });
  };

  const emailClick = () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: 'email' });
  };

  const facebook = (
    <Facebook
      url={getUrl('facebook')}
      className="sharingButton facebook"
      onClick={facebookClick}
    >
      <FacebookIcon ariaHidden name="facebook" />
      <span aria-hidden>{'Facebook'}</span>
    </Facebook>
  );

  const messenger = (
    <Messenger
      className="sharingButton messenger"
      onClick={messengerClick}
      url={getUrl('messenger')}
    >
      <MessengerIcon ariaHidden name="messenger" />
      <span aria-hidden>{'Messenger'}</span>
    </Messenger>
  );

  const whatsapp = (
    <WhatsApp
      className="sharingButton whatsapp"
      onClick={whatsAppClick}
      url={getUrl('whatsapp')}
      whatsAppMessage={whatsAppMessage}
    >
      <WhatsAppIcon ariaHidden name="whatsapp" />
      <span aria-hidden>{'WhatsApp'}</span>
    </WhatsApp>
  );

  const twitter = (
    <Twitter
      twitterMessage={twitterMessage}
      url={getUrl('twitter')}
      className={`sharingButton twitter ${
        !emailSubject || !emailBody ? 'last' : ''
      }`}
      onClick={twitterClick}
    >
      <TwitterIcon ariaHidden name="twitter" />
      <span aria-hidden>{'Twitter'}</span>
    </Twitter>
  );

  const email = (
    <Email
      className="sharingButton last email"
      onClick={emailClick}
      emailBody={emailBody}
      emailSubject={emailSubject}
    >
      <EmailIcon ariaHidden name="email" />
      <span aria-hidden>{'Email'}</span>
    </Email>
  );

  return (
    <Container id={id || ''} className={className || ''}>
      {facebook}
      {messenger}
      {whatsapp}
      {twitter}
      {email}
    </Container>
  );
};

export default SharingDropdownContent;
