import React, { useState, Suspense } from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import checkIfUserExceedsSeats from 'api/users/checkIfUserExceedsSeats';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AddByEmail from 'components/admin/AddModerator/AddByEmail';
import ModeratorUserSearch from 'components/admin/AddModerator/ModeratorUserSearch';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import SeatLimitReachedModal from '../SeatBasedBilling/SeatLimitReachedModal';

import messages from './messages';

export type UserParams = {
  user_id?: string;
  user_email?: string;
};

interface Props {
  projectId?: string;
  folderId?: string;
  spaceId?: string;
  onAddModerator: (params: UserParams) => Promise<void>;
}

const AddModerator = ({
  projectId,
  folderId,
  spaceId,
  onAddModerator,
}: Props) => {
  const { formatMessage } = useIntl();
  const [showSeatLimitModal, setShowSeatLimitModal] =
    useState<UserParams | null>(null);

  // The invite feature can currently only be used if password login
  // is enabled. So if it's disabled, we need to hide the email invite option.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  return (
    <>
      <ModeratorUserSearch
        projectId={projectId}
        folderId={folderId}
        spaceId={spaceId}
        onAddModerator={async (user_id: string) => {
          const shouldOpenModal = await checkIfUserExceedsSeats({
            user_id,
            seat_type: 'moderator',
          });

          if (shouldOpenModal) {
            setShowSeatLimitModal({ user_id });
          } else {
            await onAddModerator({ user_id });
          }
        }}
      />
      {passwordLoginEnabled && (
        <>
          <Box maxWidth="500px" mt="28px">
            <Or />
          </Box>
          <AddByEmail
            onSubmit={async (user_email) => {
              const shouldOpenModal = await checkIfUserExceedsSeats({
                user_email,
                seat_type: 'moderator',
              });

              if (shouldOpenModal) {
                setShowSeatLimitModal({ user_email });
              } else {
                await onAddModerator({ user_email });
              }
            }}
          />
        </>
      )}
      <Box mt="40px">
        <Text
          color="primary"
          p="0px"
          mb="32px"
          style={{ fontWeight: '500', fontSize: '18px' }}
        >
          {formatMessage(messages.whoAreTheManagers)}
        </Text>
      </Box>
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
      <Suspense fallback={null}>
        <SeatLimitReachedModal
          seatType="moderator"
          addModerators={() => {
            if (showSeatLimitModal === null) return;
            onAddModerator(showSeatLimitModal);
          }}
          showModal={!!showSeatLimitModal}
          closeModal={() => setShowSeatLimitModal(null)}
        />
      </Suspense>
    </>
  );
};

export default AddModerator;
