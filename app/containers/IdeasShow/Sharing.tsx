import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import { FacebookButton, TwitterButton } from 'react-social';

// components
import Icon from 'components/UI/Icon';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { lighten } from 'polished';

const facebookColor = '#3b5998';

const twitterColor = '#1ea4f2';

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
    width: 18px;
    transition: all 100ms ease-out;
  }
`;

const Text = styled.div`
  max-width: 200px;
  font-size: 15px;
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
    margin: 0;
    padding: 0;
    cursor: pointer;
    transition: all 100ms ease-out;

    ${media.smallerThanMaxTablet`
      /* margin: 0;
      margin-top: 10px;
      margin-bottom: 10px; */
    `}

    &.twitter {
      ${Text} {
        color: ${lighten(0.1, twitterColor)};
        color: #84939E;
      }

      ${IconWrapper} svg {
        fill: ${lighten(0.1, twitterColor)};
        fill: #84939E;
      }

      &:hover {
        ${Text} {
          color: ${twitterColor};
        }

        ${IconWrapper} svg {
          fill: ${twitterColor};
        }
      }
    }

    &.facebook {
      ${Text} {
        color: ${lighten(0.1, facebookColor)};
        color: #84939E;
      }

      ${IconWrapper} svg {
        fill: ${lighten(0.1, facebookColor)};
        fill: #84939E;
      }

      &:hover {
        ${Text} {
          color: ${facebookColor};
        }

        ${IconWrapper} svg {
          fill: ${facebookColor};
        }
      }
    }
  }
`;

interface ITracks {
  clickFbShare: () => void;
  clickTwitterShare: () => void;
}

type Props = {
  imageUrl: string | null;
};

type State = {
  currentTenant: ITenant | null;
};

class Sharing extends React.PureComponent<Props & ITracks, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({ currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant } = this.state;

    if (currentTenant) {
      const className = this.props['className'];
      const { imageUrl, clickFbShare, clickTwitterShare } = this.props;
      const facebookSettings = (currentTenant && currentTenant.data.attributes.settings.facebook_login ? currentTenant.data.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const href = window.location.href;
      const facebookText = <FormattedMessage {...messages.shareOnFacebook} />;
      const twitterText = <FormattedMessage {...messages.shareOnTwitter} />;

      const facebook = (facebookAppId ? (
        <FacebookButton
          className="sharingButton facebook first"
          url={href}
          appId={facebookAppId}
          sharer={true}
          media={imageUrl}
          onClick={clickFbShare}
        >
          <IconWrapper>
            <Icon name="facebook" />
          </IconWrapper>
          <Text>{facebookText}</Text>
        </FacebookButton>
      ) : null);

      const twitter = (
        <TwitterButton
          className="sharingButton twitter"
          url={href}
          sharer={true}
          media={imageUrl}
          onClick={clickTwitterShare}
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
          {twitter}
        </Container>
      );
    }

    return null;
  }
}

export default injectTracks<Props>({
  clickFbShare: tracks.clickFbShare,
  clickTwitterShare: tracks.clickTwitterShare,
})(Sharing);
