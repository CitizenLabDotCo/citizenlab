import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px;
  position: relative;
  background: #fff;
`;

const LogoContainer = styled.div`
  height: 55px;
`;

const Logo = styled.img`
  width: auto;
  height: 100%;
`;

const Slogan = styled.div`
  width: 100%;
  max-width: 500px;
  color: ${props => props.theme.colorMain || '#333'};
  font-size: 40px;
  line-height: 50px;
  font-weight: 400;
  margin-top: 55px;
`;

type Props = {};

type State = {
  currentTenant: ITenant | null;
};

export default class SignInUpBanner extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant } = this.state;
    const currentTenantLogo = (currentTenant && currentTenant.data.attributes.logo ? currentTenant.data.attributes.logo.large : null);

    return (
      <Container>
        <LogoContainer>
          {currentTenantLogo && <Logo src={currentTenantLogo} />}
          <Slogan><FormattedMessage {...messages.slogan} /></Slogan>
        </LogoContainer>
      </Container>
    );
  }
}
