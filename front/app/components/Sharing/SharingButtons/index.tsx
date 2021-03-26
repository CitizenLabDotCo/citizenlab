import React, { memo } from 'react';

// components
import { Icon } from 'cl2-component-library';
import Facebook from '../buttons/Facebook';
import Twitter from '../buttons/Twitter';
import Messenger from '../buttons/Messenger';
import WhatsApp from '../buttons/WhatsApp';
import Email from '../buttons/Email';

// i18n
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// utils
import { getUrlWithUtm, UtmParams, Medium } from '../utils';

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

  &.columnLayout {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .sharingButton {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;

    &.rowLayout {
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

    &.columnLayout {
      margin-bottom: 15px;

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
  layout?: 'rowLayout' | 'columnLayout';
}

{
  /*
    This component is not just a grouping of all buttons in the buttons folder.
    This component applies certain styles to the buttons (see above), so it's
    an independent component.
  */
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

    const trackClick = (medium: Medium) => () => {
      const properties = isInModal
        ? { modal: 'true', network: medium }
        : { network: medium };

      trackEventByName(tracks.shareButtonClicked.name, properties);
    };

    const layoutClassName =
      layout === 'columnLayout' ? 'columnLayout' : 'rowLayout';

    const facebook = (
      <Facebook
        url={getUrl('facebook')}
        className={`sharingButton facebook ${layoutClassName}`}
        onClick={trackClick('facebook')}
      >
        {/*
          For all sharing components, the components inside the child wrapper are aria-hidden.
          The reasons are that (1) there's an aria-label for the text in all the components themselves
          so we don't need to rely on the person who uses the component to think of adding text.
          and (2) the icon needs to be hidden by default.
        */}
        <>
          <StyledIcon ariaHidden name="facebook" />
          {layout === 'columnLayout' && (
            <ButtonText aria-hidden>
              {formatMessage(messages.shareOnFacebook)}
            </ButtonText>
          )}
        </>
      </Facebook>
    );

    const messenger = (
      <Messenger
        className={`sharingButton messenger ${layoutClassName}`}
        onClick={trackClick('messenger')}
        url={getUrl('messenger')}
      >
        <>
          <StyledIcon ariaHidden name="messenger" />
          {layout === 'columnLayout' && (
            <ButtonText aria-hidden>
              {formatMessage(messages.shareViaMessenger)}
            </ButtonText>
          )}
        </>
      </Messenger>
    );

    const whatsapp = (
      <WhatsApp
        className={`sharingButton whatsapp ${layoutClassName}`}
        onClick={trackClick('whatsapp')}
        whatsAppMessage={whatsAppMessage}
        url={getUrl('whatsapp')}
      >
        <>
          <StyledIcon ariaHidden name="whatsapp" />
          {layout === 'columnLayout' && (
            <ButtonText aria-hidden>
              {formatMessage(messages.shareViaWhatsApp)}
            </ButtonText>
          )}
        </>
      </WhatsApp>
    );

    const twitter = (
      <Twitter
        twitterMessage={twitterMessage}
        url={getUrl('twitter')}
        className={`sharingButton twitter ${
          !emailSubject || !emailBody ? 'last' : ''
        } ${layoutClassName}`}
        onClick={trackClick('twitter')}
      >
        <>
          <StyledIcon ariaHidden name="twitter" />
          {layout === 'columnLayout' && (
            <ButtonText aria-hidden>
              {formatMessage(messages.shareOnTwitter)}
            </ButtonText>
          )}
        </>
      </Twitter>
    );

    const email =
      emailSubject && emailBody ? (
        <Email
          className={`sharingButton last email ${layoutClassName}`}
          onClick={trackClick('email')}
          emailSubject={emailSubject}
          emailBody={emailBody}
        >
          <>
            <StyledIcon ariaHidden name="email" />
            {layout === 'columnLayout' && (
              <ButtonText aria-hidden>
                {formatMessage(messages.shareByEmail)}
              </ButtonText>
            )}
          </>
        </Email>
      ) : null;

    const titleMessage = {
      idea: <FormattedMessage {...messages.share} />,
      project: <FormattedMessage {...messages.share} />,
      initiative: <FormattedMessage {...messages.shareThisInitiative} />,
      folder: <FormattedMessage {...messages.shareThisFolder} />,
    }[context];

    return (
      <Container id={id || ''} className={className || ''}>
        {layout !== 'columnLayout' && (
          <Title isInModal={isInModal}>{titleMessage}</Title>
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
