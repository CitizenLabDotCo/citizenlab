import React from 'react';
import tracks from '../tracks';
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import { Icon } from 'cl2-component-library';
import Facebook from '../buttons/Facebook';
import Twitter from '../buttons/Twitter';
import Messenger from '../buttons/Messenger';
import WhatsApp from '../buttons/WhatsApp';
import Email from '../buttons/Email';

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

  const handleClick = (medium: Medium) => () => {
    trackEventByName(tracks.shareButtonClicked.name, { network: medium });
  };

  const facebook = (
    <Facebook
      url={getUrl('facebook')}
      className="sharingButton facebook"
      onClick={handleClick('facebook')}
    >
      {/*
        For all sharing components, both children are aria-hidden.
        The reasons are that (1) there's an aria-label for the text in all the components themselves
        so we don't need to rely on the person who uses the component to think of adding text.
        and (2) the icon needs to be hidden by default.
      */}
      <FacebookIcon ariaHidden name="facebook" />
      <span aria-hidden>{'Facebook'}</span>
    </Facebook>
  );

  const messenger = (
    <Messenger
      className="sharingButton messenger"
      onClick={handleClick('messenger')}
      url={getUrl('messenger')}
    >
      <MessengerIcon ariaHidden name="messenger" />
      <span aria-hidden>{'Messenger'}</span>
    </Messenger>
  );

  const whatsapp = (
    <WhatsApp
      className="sharingButton whatsapp"
      onClick={handleClick('whatsapp')}
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
      className={'sharingButton twitter'}
      onClick={handleClick('twitter')}
    >
      <TwitterIcon ariaHidden name="twitter" />
      <span aria-hidden>{'Twitter'}</span>
    </Twitter>
  );

  const email = (
    <Email
      className="sharingButton email"
      onClick={handleClick('email')}
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
