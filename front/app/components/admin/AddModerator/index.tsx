import React from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AddByEmail from 'components/admin/AddModerator/AddByEmail';
import ModeratorUserSearch from 'components/admin/AddModerator/ModeratorUserSearch';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useAddModerator, { UserParams } from './useAddModerator';

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
  const { addModerator, seatLimitModal } = useAddModerator(onAddModerator);

  // The invite feature can currently only be used if password login
  // is enabled. So if it's disabled, we need to hide the email invite option.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  return (
    <>
      <ModeratorUserSearch
        projectId={projectId}
        folderId={folderId}
        spaceId={spaceId}
        onAddModerator={(user_id: string) => addModerator({ user_id })}
      />
      {passwordLoginEnabled && (
        <>
          <Box maxWidth="500px" mt="28px">
            <Or />
          </Box>
          <AddByEmail onSubmit={(user_email) => addModerator({ user_email })} />
        </>
      )}
      <Box mt="40px">
        <Text
          color="primary"
          p="0px"
          mb="20px"
          style={{ fontWeight: '500', fontSize: '18px' }}
        >
          {formatMessage(messages.whoAreTheManagers)}
        </Text>
      </Box>
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
      {seatLimitModal}
    </>
  );
};

export default AddModerator;
