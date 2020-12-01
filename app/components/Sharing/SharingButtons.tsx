import React, { memo } from 'react';

// components
import { Icon } from 'cl2-component-library';
import Facebook from './Facebook';
import Twitter from './Twitter';
import Messenger from './Messenger';
import WhatsApp from './WhatsApp';
import Email from './Email';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// utils
import { getUrlWithUtm, UtmParams, Medium } from './';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3<{ isInModal?: boolean }>`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 12px;
  padding: 0;
  justify-content: ${({ isInModal }) => (isInModal ? 'center' : 'start')};
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: #fff;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;

  &.layout2 {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .sharingButton {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;

    &.layout1 {
      margin-right: 5px;

      &.last {
        margin-right: 0px;
      }

      ${media.largePhone`
        flex-basis: calc(50% - 2.5px);

        &:nth-child(odd) {
          margin-right: 5px;

          &.last {
            margin-right: 0px;
          }
        }

        &:nth-child(-n+2) {
          margin-bottom: 5px;
        }

        &:nth-child(even) {
          margin-right: 0;
        }
      `}
    }

    &.layout2 {
      margin-bottom: 12px;

      &.last {
        margin-bottom: 0px;
      }
    }

    &.twitter {
      background: ${colors.twitter};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.twitter)};
      }
    }

    &.whatsapp {
      color: #fff;
      background: #23b43a;

      &:hover {
        color: #fff;
        background: ${darken(0.12, '#23B43A')};
      }
    }

    &.messenger {
      background: ${colors.facebookMessenger};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.facebookMessenger)};
      }

      ${media.biggerThanMaxTablet`
        display: none;
      `}
    }

    &.facebook {
      background: ${colors.facebook};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.facebook)};
      }
    }

    &.email {
      color: #fff;
      background: ${(props: any) => props.theme.colorMain};

      ${StyledIcon} {
        fill: #fff;
      }

      &:hover {
        background: ${(props: any) => darken(0.1, props.theme.colorMain)};
      }
    }
  }
`;

const ButtonText = styled.span`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-left: 10px;
`;

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder';
  isInModal?: boolean;
  className?: string;
  url: string;
  twitterMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams: UtmParams;
  id?: string;
  layout?: 1 | 2;
}

const SharingButtons = memo(
  ({
    context,
    twitterMessage,
    whatsAppMessage,
    emailSubject,
    emailBody,
    className,
    intl: { formatMessage },
    isInModal,
    id,
    url,
    utmParams,
    layout,
  }: Props & InjectedIntlProps) => {
    const getUrl = (medium: Medium) => {
      return getUrlWithUtm(medium, url, utmParams);
    };

    const trackClick = (medium: Medium) => {
      const properties = isInModal
        ? { modal: 'true', network: medium }
        : { network: medium };

      trackEventByName(tracks.shareButtonClicked.name, properties);
    };

    const handleMessengerClick = () => {
      trackClick('messenger');
    };

    const handleWhatsAppClick = () => {
      trackClick('whatsapp');
    };

    const handleEmailClick = () => {
      trackClick('email');
    };

    const handleFacebookClick = () => {
      trackClick('facebook');
    };

    const handleTwitterClick = () => {
      trackClick('twitter');
    };

    const layoutClassName = layout === 2 ? 'layout2' : 'layout1';

    const facebook = (
      <Facebook
        url={getUrl('facebook')}
        className={`sharingButton facebook ${layoutClassName}`}
        onClick={handleFacebookClick}
      >
        <StyledIcon ariaHidden name="facebook" />
        <ButtonText aria-hidden>
          {layout === 2 ? formatMessage(messages.shareOnFacebook) : ''}
        </ButtonText>
      </Facebook>
    );

    const messenger = (
      <Messenger
        className={`sharingButton messenger ${layoutClassName}`}
        onClick={handleMessengerClick}
        url={getUrl('messenger')}
      >
        <StyledIcon ariaHidden name="messenger" />
        <ButtonText aria-hidden>
          {layout === 2 ? formatMessage(messages.shareViaMessenger) : ''}
        </ButtonText>
      </Messenger>
    );

    const whatsapp = (
      <WhatsApp
        className={`sharingButton whatsapp ${layoutClassName}`}
        onClick={handleWhatsAppClick}
        whatsAppMessage={whatsAppMessage}
        url={getUrl('whatsapp')}
      >
        <StyledIcon ariaHidden name="whatsapp" />
        <ButtonText aria-hidden>
          {layout === 2 ? formatMessage(messages.shareViaWhatsApp) : ''}
        </ButtonText>
      </WhatsApp>
    );

    const twitter = (
      <Twitter
        twitterMessage={twitterMessage}
        url={getUrl('twitter')}
        className={`sharingButton twitter ${
          !emailSubject || !emailBody ? 'last' : ''
        } ${layoutClassName}`}
        onClick={handleTwitterClick}
      >
        <StyledIcon ariaHidden name="twitter" />
        <ButtonText aria-hidden>
          {layout === 2 ? formatMessage(messages.shareOnTwitter) : ''}
        </ButtonText>
      </Twitter>
    );

    const email =
      emailSubject && emailBody ? (
        <Email
          className={`sharingButton last email ${layoutClassName}`}
          onClick={handleEmailClick}
          emailSubject={emailSubject}
          emailBody={emailBody}
        >
          <StyledIcon ariaHidden name="email" />
          <ButtonText aria-hidden>
            {layout === 2 ? formatMessage(messages.shareByEmail) : ''}
          </ButtonText>
        </Email>
      ) : null;

    return (
      <Container id={id || ''} className={className || ''}>
        {layout !== 2 && (
          <Title isInModal={isInModal}>
            {context === 'idea' && <FormattedMessage {...messages.shareIdea} />}
            {context === 'project' && <FormattedMessage {...messages.share} />}
            {context === 'initiative' && (
              <FormattedMessage {...messages.shareThisInitiative} />
            )}
            {context === 'folder' && (
              <FormattedMessage {...messages.shareThisFolder} />
            )}
          </Title>
        )}
        <Buttons className={layoutClassName}>
          {facebook}
          {messenger}
          {whatsapp}
          {twitter}
          {email}
        </Buttons>
      </Container>
    );
  }
);

export default injectIntl(SharingButtons);
