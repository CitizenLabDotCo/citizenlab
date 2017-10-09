import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { FacebookButton, FacebookCount, TwitterButton, TwitterCount } from 'react-social';

// components
import { Icon } from 'semantic-ui-react';

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

const Container = styled.div`
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
`;

const Text = styled.div`
  color: #84939d;
  font-size: 16px;
  font-weight: 400;
  transition: all 120ms ease-out;
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 18px;

  &.facebook {
    ${IconWrapper} {
      color: #4D6695;
    }

    &:hover {
      ${Text} {
        color: #4D6695;
      }
    }
  }

  &.twitter
    ${IconWrapper} {
      color: #26A0F2;
    }

    &:hover {
      ${Text} {
        color: #26A0F2;
      }
    }
  }
`;

const Separator = styled.div`
  border: solid #fafafa 1px;
  background: #eaeaea;
  width: 100%;
  height: 3px;
  margin: 10px 0;
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

      const facebook = ((facebookSettings && facebookAppId) ? (
        <Line className="facebook">
          <IconWrapper>
            <FacebookButton url={href} appId={facebookAppId} sharer={true} media={imageUrl} onClick={clickFbShare}>
              <Icon name="facebook official" />
            </FacebookButton>
          </IconWrapper>
          <Text>{facebookText}</Text>
        </Line>
      ) : null);

      const twitter = (
        <Line className="twitter">
          <IconWrapper>
            <TwitterButton url={href} sharer={true} media={imageUrl} onClick={clickTwitterShare}>
              <Icon name="twitter" />
            </TwitterButton>
          </IconWrapper>
          <Text>{twitterText}</Text>
        </Line>
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
