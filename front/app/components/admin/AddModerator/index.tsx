import React from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';

import AddByEmail from 'components/admin/AddModerator/AddByEmail';
import UserSearch from 'components/admin/AddModerator/ModeratorUserSearch';
import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

type UserParams = {
  userId?: string;
  userEmail?: string;
};

interface Props {
  onAddModerator: (params: UserParams) => Promise<void>;
}

const AddModerator = ({ onAddModerator }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();

  return (
    <>
      <Text
        color="primary"
        p="0px"
        mb="32px"
        style={{ fontWeight: '500', fontSize: '18px' }}
      >
        {formatMessage(messages.addProjectModerators)}
      </Text>
      {isAdmin(authUser) && (
        <>
          <UserSearch projectId={projectId} />
          <Box maxWidth="500px" mt="28px">
            <Or />
          </Box>
        </>
      )}
      <AddByEmail
        onSubmit={async (email) => {
          await onAddModerator({ userEmail: email });
        }}
      />
      <Box mt="40px">
        <Text
          color="primary"
          p="0px"
          mb="32px"
          style={{ fontWeight: '500', fontSize: '18px' }}
        >
          {formatMessage(messages.moderatorSearchFieldLabel)}
        </Text>
        <ModeratorList projectId={projectId} />
      </Box>
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
    </>
  );
};

export default AddModerator;
