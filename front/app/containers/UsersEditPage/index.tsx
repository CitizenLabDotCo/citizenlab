import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import CampaignsConsentForm from 'components/CampaignConsentForm';
import Unauthorized from 'components/Unauthorized';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import FragmentForm from './FragmentForm';
import LoginCredentials from './LoginCredentials';
import messages from './messages';
import ProfileDeletion from './ProfileDeletion';
import ProfileForm from './ProfileForm';
import UsersEditPageMeta from './UsersEditPageMeta';
import VerificationStatus from './VerificationStatus';

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
  const { data: appConfig } = useAppConfiguration();
  const passwordLoginActive = useFeatureFlag({ name: 'password_login' });
  const { data: authUser } = useAuthUser();
  const loaded = appConfig !== undefined && authUser !== undefined;
  const showEditPage =
    loaded && !isNilOrError(appConfig) && !isNilOrError(authUser);

  if (loaded && !authUser) {
    clHistory.push('/');
  }

  if (showEditPage && !authUser.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  if (showEditPage) {
    return (
      <Container id="e2e-user-edit-profile-page">
        <UsersEditPageMeta authUser={authUser} />
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
          {passwordLoginActive && <LoginCredentials user={authUser.data} />}
          <ProfileDeletion />
          <CampaignsConsentForm />
        </Wrapper>
      </Container>
    );
  }

  return null;
};
