// Libraries
import React from 'react';
// Hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// router
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
// Styles
import styled from 'styled-components';
import CampaignsConsentForm from './CampaignsConsentForm';
import FragmentForm from './FragmentForm';
import ProfileDeletion from './ProfileDeletion';
// Components
import ProfileForm from './ProfileForm';
import UsersEditPageMeta from './UsersEditPageMeta';
import VerificationStatus from './VerificationStatus';
import messages from './messages';

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
  const appConfig = useAppConfiguration();
  const authUser = useAuthUser();
  const loaded = appConfig !== undefined && authUser !== undefined;

  if (loaded && !authUser) {
    clHistory.push('/');
  }

  if (loaded && !isNilOrError(appConfig) && !isNilOrError(authUser)) {
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
          <VerificationStatus />
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
