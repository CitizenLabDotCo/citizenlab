import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import CampaignsConsentForm from 'components/CampaignConsentForm';
import Unauthorized from 'components/Unauthorized';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import LoginCredentials from './LoginCredentials';
import messages from './messages';
import ProfileDeletion from './ProfileDeletion';
import ProfileForm from './ProfileForm';
import tracks from './tracks';
import UsersEditPageMeta from './UsersEditPageMeta';
import VerificationStatus from './VerificationStatus';

const Container = styled.div`
  width: 100%;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 50px;
  overflow-x: hidden;
`;

const UsersEditPage = () => {
  const passwordLoginActive = useFeatureFlag({ name: 'password_login' });
  const { data: authUser } = useAuthUser();

  if (!authUser?.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  return (
    <>
      <UsersEditPageMeta authUser={authUser} />
      <main>
        <Container id="e2e-user-edit-profile-page">
          <ScreenReaderOnly>
            <FormattedMessage
              tagName="h1"
              {...messages.invisibleTitleUserSettings}
            />
          </ScreenReaderOnly>
          {/*
        To have two forms with an equal width,
        the forms need to be wrapped with a div.
        https://stackoverflow.com/questions/34993826/flexbox-column-direction-same-width
      */}
          <div>
            <VerificationStatus />
            <ProfileForm />
            {passwordLoginActive && <LoginCredentials user={authUser.data} />}
            <ProfileDeletion />
            <CampaignsConsentForm
              trackEventName={tracks.defaultSettingsChanged}
            />
          </div>
        </Container>
      </main>
    </>
  );
};

export default UsersEditPage;
