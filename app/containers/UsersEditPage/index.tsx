// Libraries
import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { adopt } from 'react-adopt';

// router
import clHistory from 'utils/cl-router/history';

// Services
import { areasStream, IAreas } from 'services/areas';
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import ProfileForm from './ProfileForm';
import CampaignsConsentForm from './CampaignsConsentForm';
import ProfileDeletion from './ProfileDeletion';
import VerificationStatus from './VerificationStatus';
import UsersEditPageMeta from './UsersEditPageMeta';

// Styles
import styled from 'styled-components';
import { colors, ScreenReaderOnly } from 'utils/styleUtils';

// Resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.main`
  width: 100%;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 50px;
  overflow-x: hidden;
`;

// To have two forms with an equal width,
// the forms need to be wrapped with a div.
// https://stackoverflow.com/questions/34993826/flexbox-column-direction-same-width
const Wrapper = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface InputProps {}

interface Props extends DataProps, InputProps {}

interface State {
  areas: IAreas | null;
  currentTenant: ITenant | null;
  loaded: boolean;
}

class ProfileEditor extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      areas: null,
      currentTenant: null,
      loaded: false
    };
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      combineLatest(
        currentTenant$,
        areas$
      ).subscribe(([currentTenant, areas]) => {
        this.setState({ currentTenant, areas, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant, areas, loaded } = this.state;
    const { authUser } = this.props;

    if (loaded && !authUser) {
      clHistory.push('/');
    }

    if (loaded && currentTenant && areas && authUser) {
      return (
        <Container id="e2e-user-edit-profile-page">
          <UsersEditPageMeta user={authUser} />
          <ScreenReaderOnly>
            <FormattedMessage tagName="h1" {...messages.invisibleTitleUserSettings} />
          </ScreenReaderOnly>
          <Wrapper>
            <VerificationStatus />
            <ProfileForm
              user={authUser}
              areas={areas.data}
              tenant={currentTenant.data}
            />
            <ProfileDeletion/>
            <CampaignsConsentForm />
          </Wrapper>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <ProfileEditor {...inputProps} {...dataprops} />}
  </Data>
);
