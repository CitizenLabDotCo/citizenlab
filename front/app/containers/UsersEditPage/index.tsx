// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import CampaignsConsentForm from './CampaignsConsentForm';
import FragmentForm from './FragmentForm';
import ProfileDeletion from './ProfileDeletion';
import ProfileForm from './ProfileForm';
import UsersEditPageMeta from './UsersEditPageMeta';

// Styles
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { colors } from 'utils/styleUtils';

// Hooks
import Outlet from 'components/Outlet';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';

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

export default () => {
  const tenant = useAppConfiguration();
  const authUser = useAuthUser();
  const loaded = tenant !== undefined && authUser !== undefined;

  if (loaded && !authUser) {
    clHistory.push('/sign-in');
  }

  if (loaded && !isNilOrError(tenant) && !isNilOrError(authUser)) {
    return (
      <Container id="e2e-user-edit-profile-page">
        <UsersEditPageMeta user={authUser} />
        <ScreenReaderOnly>
          <FormattedMessage
            tagName="h1"
            {...messages.invisibleTitleUserSettings}
          />
        </ScreenReaderOnly>
        <Wrapper>
          <Outlet id="app.containers.UserEditPage.content" />
          <ProfileForm />
          <FragmentForm />
          <ProfileDeletion />
          <CampaignsConsentForm />
        </Wrapper>
      </Container>
    );
  }

  return null;
};
