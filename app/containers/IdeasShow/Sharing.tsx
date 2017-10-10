import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { FacebookButton, FacebookCount, TwitterButton, TwitterCount } from 'react-social';

// components
import Icon from 'components/UI/Icon';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// analytics
import { injectTracks, trackPage } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { lighten, darken } from 'polished';

const facebookColor = '#3b5998';
const facebookBgColor = '#ebeef4';

const twitterColor = '#1ea4f2';
const twitterBgColor = '#e8f6fe';

const IconWrapper = styled.div`
  width: 30px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  justify-content: flex-start;

  svg {
    width: 18px;
    transition: all 100ms ease-out;
  }
`;

const Text = styled.div`
  font-size: 15px;
  font-weight: 300;
  white-space: nowrap;
  transition: all 100ms ease-out;
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
    cursor: pointer;
    transition: all 100ms ease-out;
    margin: 0;
    padding: 0;
    margin-bottom: 20px;

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

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
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
      const {  imageUrl, clickFbShare, clickTwitterShare } = this.props;
      const { formatMessage } = this.props.intl;
      const facebookSettings = (currentTenant && currentTenant.data.attributes.settings.facebook_login ? currentTenant.data.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const href = window.location.href;
      const facebookText = formatMessage(messages.shareOnFacebook);
      const twitterText = formatMessage(messages.shareOnTwitter);

      const facebook = (facebookAppId ? (
        <FacebookButton
          className="sharingButton facebook"
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
})(injectIntl<Props>(Sharing));
