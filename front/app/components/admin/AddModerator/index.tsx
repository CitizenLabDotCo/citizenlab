import React, { useState, Suspense } from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import AddByEmail from 'components/admin/AddModerator/AddByEmail';
import UserSearch from 'components/admin/AddModerator/ModeratorUserSearch';
import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Or from 'components/UI/Or';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import SeatLimitReachedModal from '../SeatBasedBilling/SeatLimitReachedModal';

import messages from './messages';

type UserParams = {
  userId?: string;
  userEmail?: string;
};

interface Props {
  projectId: string; // TODO remove
  addModeratorsMessage: MessageDescriptor;
  onAddModerator: (params: UserParams) => Promise<void>;
}

const AddModerator = ({
  projectId,
  addModeratorsMessage,
  onAddModerator,
}: Props) => {
  const { formatMessage } = useIntl();
  const [moderatorToAddThroughSearch, setModeratorToAddThroughSearch] =
    useState<IUserData | null>(null);
  const [showSeatLimitModal, setShowSeatLimitModal] = useState(false);

  const { data: authUser } = useAuthUser();

  return (
    <>
      <Text
        color="primary"
        p="0px"
        mb="32px"
        style={{ fontWeight: '500', fontSize: '18px' }}
      >
        {formatMessage(addModeratorsMessage)}
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
          {formatMessage(messages.whoAreTheManagers)}
        </Text>
        <ModeratorList projectId={projectId} />
      </Box>
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
      <Suspense fallback={null}>
        <SeatLimitReachedModal
          seatType="moderator"
          addModerators={() => {
            onAddModerator({ userId: moderatorToAddThroughSearch?.id });
          }}
          showModal={showSeatLimitModal}
          closeModal={() => setShowSeatLimitModal(false)}
        />
      </Suspense>
    </>
  );
};

export default AddModerator;
