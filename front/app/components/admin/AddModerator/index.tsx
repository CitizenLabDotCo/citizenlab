import React, { useState, Suspense } from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import AddByEmail from 'components/admin/AddModerator/AddByEmail';
import ModeratorUserSearch from 'components/admin/AddModerator/ModeratorUserSearch';
import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import SeatLimitReachedModal from '../SeatBasedBilling/SeatLimitReachedModal';

import messages from './messages';

type UserParams = {
  moderatorId?: string;
  moderatorEmail?: string;
};

interface Props {
  projectId: string; // TODO remove
  onAddModerator: (params: UserParams) => Promise<void>;
}

const AddModerator = ({ projectId, onAddModerator }: Props) => {
  const { formatMessage } = useIntl();
  const [showSeatLimitModal, setShowSeatLimitModal] = useState(false);

  const { data: authUser } = useAuthUser();

  return (
    <>
      {isAdmin(authUser) && (
        <>
          <ModeratorUserSearch
            projectId={projectId}
            onAddModerator={async (userId: string) => {
              // TODO
            }}
          />
          <Box maxWidth="500px" mt="28px">
            <Or />
          </Box>
        </>
      )}
      <AddByEmail
        onSubmit={async (email) => {
          // TODO
          await onAddModerator({ moderatorEmail: email });
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
            // onAddModerator({ moderatorId: moderatorToAddThroughSearch?.id });
          }}
          showModal={showSeatLimitModal}
          closeModal={() => setShowSeatLimitModal(false)}
        />
      </Suspense>
    </>
  );
};

export default AddModerator;
