import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// libraries
import { FacebookButton, TwitterButton } from 'react-social';

// components
import { Icon } from 'cl2-component-library';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3<{ location: 'modal' | undefined }>`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 12px;
  padding: 0;
  justify-content: ${({ location }) =>
    location === 'modal' ? 'center' : 'start'};
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

    &.facebook {
      background: ${colors.facebook};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.facebook)};
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

interface ITracks {
  clickFbShare: () => void;
  clickFbShareInModal: () => void;
  clickTwitterShare: () => void;
  clickTwitterShareInModal: () => void;
  clickMessengerShare: () => void;
  clickMessengerShareInModal: () => void;
  clickEmailShare: () => void;
  clickEmailShareInModal: () => void;
}

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface InputProps {
  context: 'idea' | 'project' | 'initiative' | 'folder';
  location?: 'modal';
  className?: string;
  url: string;
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
  id?: string;
  layout?: 1 | 2;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

class Sharing extends PureComponent<Props & ITracks & InjectedIntlProps> {
  buildUrl = (medium: string) => {
    const { utmParams, url } = this.props;
    let resUrl = url;
    if (utmParams) {
      resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=${medium}`;
      if (utmParams.content) {
        resUrl += `&utm_content=${utmParams.content}`;
      }
    }
    return resUrl;
  };

  render() {
    const {
      clickFbShare,
      clickFbShareInModal,
      clickTwitterShare,
      clickTwitterShareInModal,
      clickMessengerShare,
      clickMessengerShareInModal,
      clickEmailShare,
      clickEmailShareInModal,
      tenant,
      context,
      twitterMessage,
      emailSubject,
      emailBody,
      className,
      intl: { formatMessage },
      location,
      id,
      layout,
    } = this.props;

    if (!isNilOrError(tenant)) {
      const layoutClassName = layout === 2 ? 'layout2' : 'layout1';
      const facebookSettings =
        tenant && tenant.attributes.settings.facebook_login
          ? tenant.attributes.settings.facebook_login
          : null;
      const facebookAppId = facebookSettings ? facebookSettings.app_id : null;
      const facebookButtonText = formatMessage(messages.shareOnFacebook);
      const messengerButtonText = formatMessage(messages.shareViaMessenger);
      const twitterButtonText = formatMessage(messages.shareOnTwitter);
      const emailButtonText = formatMessage(messages.shareByEmail);
      let trackFbShare;
      let trackTwitterShare;
      let trackEmailShare;
      let trackMessengerShare;

      if (location === 'modal') {
        trackFbShare = clickFbShareInModal;
        trackTwitterShare = clickTwitterShareInModal;
        trackEmailShare = clickEmailShareInModal;
        trackMessengerShare = clickMessengerShareInModal;
      } else {
        trackFbShare = clickFbShare;
        trackTwitterShare = clickTwitterShare;
        trackEmailShare = clickEmailShare;
        trackMessengerShare = clickMessengerShare;
      }

      const facebook = facebookAppId ? (
        <FacebookButton
          appId={facebookAppId}
          url={this.buildUrl('facebook')}
          className={`sharingButton facebook first ${layoutClassName}`}
          sharer={true}
          onClick={trackFbShare}
          aria-label={facebookButtonText}
        >
          <StyledIcon name="facebook" />
          {layout === 2 && <ButtonText>{facebookButtonText}</ButtonText>}
        </FacebookButton>
      ) : null;

      const messenger = facebookAppId ? (
        <a
          className={`sharingButton messenger ${layoutClassName}`}
          href={`fb-messenger://share/?link=${encodeURIComponent(
            this.buildUrl('messenger')
          )}&app_id=${facebookAppId}`}
          onClick={trackMessengerShare}
          role="button"
          aria-label={messengerButtonText}
        >
          <StyledIcon name="messenger" />
          {layout === 2 && <ButtonText>{messengerButtonText}</ButtonText>}
        </a>
      ) : null;

      const twitter = (
        <TwitterButton
          message={twitterMessage}
          url={this.buildUrl('twitter')}
          className={`sharingButton twitter ${
            !emailSubject || !emailBody ? 'last' : ''
          } ${layoutClassName}`}
          sharer={true}
          onClick={trackTwitterShare}
          aria-label={twitterButtonText}
        >
          <StyledIcon name="twitter" />
          {layout === 2 && <ButtonText>{twitterButtonText}</ButtonText>}
        </TwitterButton>
      );

      const email =
        emailSubject && emailBody ? (
          <a
            className={`sharingButton last email ${layoutClassName}`}
            href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
            target="_blank"
            onClick={trackEmailShare}
            role="button"
            aria-label={emailButtonText}
          >
            <StyledIcon name="email" />
            {layout === 2 && <ButtonText>{emailButtonText}</ButtonText>}
          </a>
        ) : null;

      return (
        <Container id={id || ''} className={className || ''}>
          {layout !== 2 && (
            <Title location={location}>
              {context === 'idea' && (
                <FormattedMessage {...messages.shareIdea} />
              )}
              {context === 'project' && (
                <FormattedMessage {...messages.share} />
              )}
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
            {twitter}
            {email}
          </Buttons>
        </Container>
      );
    }

    return null;
  }
}

const SharingWithHocs = injectIntl<Props>(
  injectTracks<Props>({
    clickFbShare: tracks.clickFbShare,
    clickFbShareInModal: tracks.clickFbShareInModal,
    clickTwitterShare: tracks.clickTwitterShare,
    clickTwitterShareInModal: tracks.clickTwitterShareInModal,
    clickMessengerShare: tracks.clickMessengerShare,
    clickMessengerShareInModal: tracks.clickMessengerShareInModal,
    clickEmailShare: tracks.clickEmailShare,
    clickEmailShareInModal: tracks.clickEmailShareInModal,
  })(Sharing)
);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SharingWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
