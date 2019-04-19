import React from 'react';
import { adopt } from 'react-adopt';

// libraries
import { FacebookButton, TwitterButton } from 'react-social';

// components
import Icon from 'components/UI/Icon';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n

import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: #fff;
  margin-right: 12px;
`;

const Text = styled.div`
  max-width: 200px;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .sharingButton {
    width: 100%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    padding: 10px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;

    &.last {
      margin-bottom: 0px;
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
        background: ${(darken(0.15, colors.facebookMessenger))};
      }

      ${media.biggerThanMaxTablet`
        display: none;
      `}
    }

    &.email {
      background: ${colors.emailBg};
      color: ${colors.emailText};

      ${StyledIcon} {
        fill: ${colors.emailText};
      }

      &:hover {
        background: ${(darken(0.1, colors.emailBg))};
      }
    }
  }
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
  location?: 'modal';
  className?: string;
  url: string;
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps> {
  buildUrl = (medium : string) => {
    const { utmParams, url } = this.props;
    let resUrl = url;
    if (utmParams) {
      resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=${medium}`;
      if (utmParams.content) {
        resUrl += `&utm_content=${utmParams.content}`;
      }
    }
    return resUrl;
  }

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
      twitterMessage,
      emailSubject,
      emailBody,
      className,
      intl: { formatMessage },
      location
    } = this.props;

    if (!isNilOrError(tenant)) {
      const facebookSettings = (tenant && tenant.attributes.settings.facebook_login ? tenant.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
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

      const facebook = (facebookAppId ? (
        <FacebookButton
          appId={facebookAppId}
          url={this.buildUrl('facebook')}
          className="sharingButton facebook first"
          sharer={true}
          onClick={trackFbShare}
        >
          <StyledIcon name="facebook" />
          <Text>{facebookButtonText}</Text>
        </FacebookButton>
      ) : null);

      const messenger = (facebookAppId ? (
        <a
          className="sharingButton messenger"
          href={`fb-messenger://share/?link=${encodeURIComponent(this.buildUrl('messenger'))}&app_id=${facebookAppId}`}
          onClick={trackMessengerShare}
        >
          <StyledIcon name="messenger" />
          <Text>{messengerButtonText}</Text>
        </a>
      ) : null);

      const twitter = (
        <TwitterButton
          message={twitterMessage}
          url={this.buildUrl('twitter')}
          className="sharingButton twitter"
          sharer={true}
          onClick={trackTwitterShare}
        >
          <StyledIcon name="twitter" />
          <Text>{twitterButtonText}</Text>
        </TwitterButton>
      );

      const email = ((emailSubject && emailBody) ? (
        <a
          className="sharingButton last email"
          href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
          onClick={trackEmailShare}
        >
          <StyledIcon name="email" />
          <Text>{emailButtonText}</Text>
        </a>
      ) : null);

      return (
        <Container className={className}>
          {facebook}
          {messenger}
          {twitter}
          {email}
        </Container>
      );
    }

    return null;
  }
}

const SharingWithHocs = injectIntl<Props>(injectTracks<Props>({
  clickFbShare: tracks.clickFbShare,
  clickFbShareInModal: tracks.clickFbShareInModal,
  clickTwitterShare: tracks.clickTwitterShare,
  clickTwitterShareInModal: tracks.clickTwitterShareInModal,
  clickMessengerShare: tracks.clickMessengerShare,
  clickMessengerShareInModal: tracks.clickMessengerShareInModal,
  clickEmailShare: tracks.clickEmailShare,
  clickEmailShareInModal: tracks.clickEmailShareInModal,
})(Sharing));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SharingWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
