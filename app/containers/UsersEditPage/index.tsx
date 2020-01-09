// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

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

// Hooks
import useAreas from 'hooks/useAreas';
import useTenant from 'hooks/useTenant';
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

interface Props {}

const ProfileEditor = React.memo<Props>(_props => {
  const authUser = useAuthUser();
  const currentTenant = useTenant();
  const areas = useAreas();

  if (authUser === null) {
    clHistory.push('/sign-in');
  }

  if (!isNilOrError(currentTenant) && !isNilOrError(areas) && !isNilOrError(authUser)) {
    return (
      <Container id="e2e-user-edit-profile-page">
        <UsersEditPageMeta user={authUser.data} />
        <ScreenReaderOnly>
          <FormattedMessage tagName="h1" {...messages.invisibleTitleUserSettings} />
        </ScreenReaderOnly>
        <Wrapper>
          <VerificationStatus />
          <ProfileForm
            user={authUser.data}
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
});

export default ProfileEditor;
