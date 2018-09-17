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
  clickEmailShare: () => void;
}

interface InputProps {
  className?: string;
  url: string;
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps> {
  render() {
    const { url, clickFbShare, clickTwitterShare, clickMessengerShare, clickEmailShare, tenant, twitterMessage, emailSubject, emailBody, className, intl: { formatMessage } } = this.props;

    if (!isNilOrError(tenant)) {
      const facebookSettings = (tenant && tenant.attributes.settings.facebook_login ? tenant.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const facebookButtonText = formatMessage(messages.shareOnFacebook);
      const messengerButtonText = formatMessage(messages.shareViaMessenger);
      const twitterButtonText = formatMessage(messages.shareOnTwitter);
      const emailButtonText = formatMessage(messages.shareByEmail);

      const facebook = (facebookAppId ? (
        <FacebookButton
          appId={facebookAppId}
          url={url}
          className="sharingButton facebook first"
          sharer={true}
          onClick={clickFbShare}
        >
          <StyledIcon name="facebook" />
          <Text>{facebookButtonText}</Text>
        </FacebookButton>
      ) : null);

      const messenger = (facebookAppId ? (
        <a
          className="sharingButton messenger"
          href={`fb-messenger://share/?link=${encodeURIComponent(url)}&app_id=${facebookAppId}`}
          onClick={clickMessengerShare}
        >
          <StyledIcon name="messenger" />
          <Text>{messengerButtonText}</Text>
        </a>
      ) : null);

      const twitter = (
        <TwitterButton
          message={twitterMessage}
          url={url}
          className="sharingButton twitter"
          sharer={true}
          onClick={clickTwitterShare}
        >
          <StyledIcon name="twitter" />
          <Text>{twitterButtonText}</Text>
        </TwitterButton>
      );

      const email = ((emailSubject && emailBody) ? (
        <a
          className="sharingButton email"
          href={`mailto:?subject=${emailSubject}body=${emailBody}`}
          onClick={clickEmailShare}
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
  clickTwitterShare: tracks.clickTwitterShare,
  clickMessengerShare: tracks.clickMessengerShare,
  clickEmailShare: tracks.clickEmailShare,
})(Sharing));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SharingWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
