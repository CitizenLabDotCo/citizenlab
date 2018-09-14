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
  width: 24px;
  height: 24px;
  fill: #fff;
  margin-right: 10px;
`;

const Text = styled.div`
  max-width: 200px;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
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
    margin: 5px 0;
    padding: 11px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 100ms ease-out;

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
      background: #e6ebec;
      color: #004d6c;

      ${StyledIcon} {
        fill: #004d6c;
      }

      &:hover {
        background: ${(darken(0.15, '#e6ebec'))};
      }
    }
  }
`;

interface ITracks {
  clickFbShare: () => void;
  clickTwitterShare: () => void;
  clickMessengerShare: () => void;
}

interface InputProps {
  className?: string;
  twitterMessage: string | JSX.Element;
  userId: string | null;
  sharedContent: string;
  emailSubject?: string;
  emailBody?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps> {
  render() {
    const { clickFbShare, clickTwitterShare, clickMessengerShare, userId, tenant, twitterMessage, emailSubject, emailBody, sharedContent, className, intl: { formatMessage } } = this.props;

    if (!isNilOrError(tenant)) {
      const facebookSettings = (tenant && tenant.attributes.settings.facebook_login ? tenant.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const href = window.location.href;
      const facebookText = formatMessage(messages.shareOnFacebook);
      const messengerText = formatMessage(messages.shareViaMessenger);
      const twitterText = formatMessage(messages.shareOnTwitter);
      const emailText = formatMessage(messages.shareByEmail);
      const fbURL = userId ? `${href}?utm_source=share_${sharedContent}&utm_medium=facebook&utm_campaign=autopublish&utm_content=${userId}` : href;
      const twitterURL = userId ? `${href}?utm_source=share_${sharedContent}&utm_medium=twitter&utm_campaign=autopublish&utm_content=${userId}` : href;

      const facebook = (facebookAppId ? (
        <FacebookButton
          className="sharingButton facebook first"
          url={fbURL}
          appId={facebookAppId}
          sharer={true}
          onClick={clickFbShare}
        >
          <StyledIcon name="facebook" />
          <Text>{facebookText}</Text>
        </FacebookButton>
      ) : null);

      const messenger = (facebookAppId ? (
        <a className="sharingButton messenger" href={`fb-messenger://share/?link=${encodeURIComponent(fbURL)}&app_id=${facebookAppId}`} onClick={clickMessengerShare}>
          <StyledIcon name="messenger" />
          <Text>{messengerText}</Text>
        </a>
      ) : null);

      const twitter = (
        <TwitterButton
          className="sharingButton twitter"
          url={twitterURL}
          sharer={true}
          onClick={clickTwitterShare}
          message={twitterMessage}
        >
          <StyledIcon name="twitter" />
          <Text>{twitterText}</Text>
        </TwitterButton>
      );

      const email = ((emailSubject && emailBody) ? (
        <a className="sharingButton email" href={`mailto:?subject=${emailSubject}body=${emailBody}`}>
          <StyledIcon name="email" />
          <Text>{emailText}</Text>
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
  clickTwitterShare: tracks.clickTwitterShare,
  clickMessengerShare: tracks.clickMessengerShare,
})(Sharing));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SharingWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
