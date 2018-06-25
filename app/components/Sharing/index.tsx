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
import { media } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';

const facebookColor = '#3b5998';

const twitterColor = '#1ea4f2';

const messengerColor = '#0084ff';

const IconWrapper = styled.div`
  width: 30px;
  height: 38px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  svg {
    width: 20px;
    transition: all 100ms ease-out;
  }
`;

const Text = styled.div`
  max-width: 200px;
  font-size: 16px;
  line-height: 19px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  * {
    outline: none;
  }

  .sharingButton {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 100ms ease-out;
    width: 100%;

    &.twitter {
      background: ${twitterColor};
      fill: #fff;
      color: #fff;

      &:hover {
        background: ${lighten(0.25, twitterColor)};
      }
    }
    &.facebook {
      background: ${facebookColor};
      fill: #fff;
      color: #fff;

      &:hover {
        background: ${lighten(0.2, facebookColor)};
      }
    }

    &.messenger {
      background: ${messengerColor};
      fill: #fff;
      color: #fff;

      &:hover {
        background: ${(lighten(0.2, messengerColor))};
      }
      ${media.biggerThanMaxTablet`
        display: none;
      `}
    }
  }
`;

interface ITracks {
  clickFbShare: () => void;
  clickTwitterShare: () => void;
  clickMessengerShare: () => void;
}

type InputProps = {
  imageUrl: string | null;
  className?: string;
  fbMessage?: string;
  twitterMessage: string;
  userId?: string | null;
};

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps> {
  render() {
    const { clickFbShare, clickTwitterShare, clickMessengerShare, imageUrl, userId, tenant, fbMessage, twitterMessage, className, intl } = this.props;
    if (!isNilOrError(tenant)) {
      const { formatMessage } = intl;
      const facebookSettings = (tenant && tenant.attributes.settings.facebook_login ? tenant.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const href = window.location.href;
      const facebookText = formatMessage(messages.shareOnFacebook);
      const messengerText = formatMessage(messages.shareViaMessenger);
      const twitterText = formatMessage(messages.shareOnTwitter);
      const fbURL = (!isNilOrError(userId)) ? `${href}?recruiter=${userId}&utm_source=share_idea&utm_medium=facebook&utm_campaign=autopublish&utm_term=share_idea` : href;
      const twitterURL = (!isNilOrError(userId)) ? `${href}?recruiter=${userId}&utm_source=share_idea&utm_medium=twitter&utm_campaign=share_idea` : href;

      const facebook = (facebookAppId ? (
        <FacebookButton
          className="sharingButton facebook first"
          url={fbURL}
          appId={facebookAppId}
          sharer={true}
          media={imageUrl}
          onClick={clickFbShare}
          message={fbMessage}
        >
          <IconWrapper>
            <Icon name="facebook" />
          </IconWrapper>
          <Text>{facebookText}</Text>
        </FacebookButton>
      ) : null);

      const messenger = (facebookAppId ? (
        <a className="sharingButton messenger" href={`fb-messenger://share/?link=${encodeURIComponent(fbURL)}&app_id=${facebookAppId}`} onClick={clickMessengerShare}>
          <IconWrapper>
            <Icon name="messenger" />
          </IconWrapper>
          <Text>{messengerText}</Text>
        </a>
      ) : null);

      const twitter = (
        <TwitterButton
          className="sharingButton twitter"
          url={twitterURL}
          sharer={true}
          media={imageUrl}
          onClick={clickTwitterShare}
          message={twitterMessage}
        >
          <IconWrapper>
            <Icon name="twitter" />
          </IconWrapper>
          <Text>{twitterText}</Text>
        </TwitterButton>
      );

      return (
        <Container className={className}>
          {facebook}
          {messenger}
          {twitter}
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
