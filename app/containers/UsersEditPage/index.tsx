// Libraries
import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';

// router
import clHistory from 'utils/cl-router/history';

// Services
import { authUserStream } from 'services/auth';
import { areasStream, IAreas } from 'services/areas';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IUser } from 'services/users';

// Components
import ProfileForm from './ProfileForm';
import CampaignsConsentForm from './CampaignsConsentForm';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  overflow-x: hidden;
`;

// To have two forms with an equal width,
// the forms need to be wrapped with a div.
// https://stackoverflow.com/questions/34993826/flexbox-column-direction-same-width
const Wrapper = styled.div``;

interface Props {}

interface State {
  authUser: IUser | null;
  areas: IAreas | null;
  currentTenant: ITenant | null;
  loaded: boolean;
}

export default class ProfileEditor extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: null,
      areas: null,
      currentTenant: null,
      loaded: false
    };
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    const authUser$ = authUserStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      combineLatest(
        currentTenant$,
        authUser$,
        areas$
      ).subscribe(([currentTenant, authUser, areas]) => {
        this.setState({ currentTenant, authUser, areas, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant, authUser, areas, loaded } = this.state;

    if (loaded && !authUser) {
      clHistory.push('/');
    }

    if (loaded && currentTenant && authUser && areas) {
      return (
        <Container>
          <Wrapper>
            <ProfileForm
              user={authUser.data}
              areas={areas.data}
              tenant={currentTenant.data}
            />
            <CampaignsConsentForm />
          </Wrapper>
        </Container>
      );
    }

    return null;
  }
}
