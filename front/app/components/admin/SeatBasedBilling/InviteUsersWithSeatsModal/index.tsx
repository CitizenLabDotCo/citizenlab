import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { TSeatNumber } from 'api/app_configuration/types';
import { IInvitesNewSeats } from 'api/invites/types';

import useExceedsSeats from 'hooks/useExceedsSeats';

import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';
import SeatSetSuccess from 'components/admin/SeatBasedBilling/SeatSetSuccess';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

export type SeatTypeTSeatNumber = {
  [key in TSeatType]: TSeatNumber;
};

export type SeatTypeNumber = {
  [key in TSeatType]: number;
};

interface InviteUsersWithSeatsModalProps {
  showModal: boolean;
  closeModal: () => void;
  inviteUsers: () => void;
  newSeatsResponse: IInvitesNewSeats;
}

const InviteUsersWithSeatsModal = ({
  showModal,
  closeModal,
  inviteUsers,
  newSeatsResponse,
}: InviteUsersWithSeatsModalProps) => {
  const { formatMessage } = useIntl();
  const [showSuccess, setShowSuccess] = useState(false);
  const newSeats = newSeatsResponse.data.attributes;

  const exceedsSeats = useExceedsSeats()({
    newlyAddedAdminsNumber: newSeats.result.newly_added_admins_number,
    newlyAddedModeratorsNumber: newSeats.result.newly_added_moderators_number,
  });

  const handleConfirmClick = () => {
    inviteUsers();
    // `inviteUsers` can fail in theory, but very unlikely in practice.
    // Errors should be displayed on the form in this case.
    setShowSuccess(true);
  };

  const header = !showSuccess ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(messages.confirmSeatUsageChange)}
    </Text>
  ) : undefined;

  let additionalSeatsMessage: string;

  // TODO JS: fix the || 0 in types below. this is a fudge to avoid errors right now!
  if (exceedsSeats.all) {
    additionalSeatsMessage = formatMessage(
      messages.additionalAdminAndManagerSeats,
      {
        adminSeats: newSeats.result.newly_added_admins_number || 0,
        managerSeats: newSeats.result.newly_added_moderators_number || 0,
      }
    );
  } else if (exceedsSeats.admin) {
    additionalSeatsMessage = formatMessage(messages.additionalAdminSeats, {
      seats: newSeats.result.newly_added_admins_number || 0,
    });
  } else {
    additionalSeatsMessage = formatMessage(messages.additionalManagerSeats, {
      seats: newSeats.result.newly_added_moderators_number || 0,
    });
  }

  const resetModal = () => {
    closeModal();
    setShowSuccess(false);
  };

  return (
    <Modal opened={showModal} close={resetModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={resetModal}
          seatType="moderator"
          hasExceededPlanSeatLimit={exceedsSeats.any}
        />
      ) : (
        <Box display="flex" flexDirection="column" p="32px">
          <Text color="textPrimary" mt="0" mb="24px">
            <FormattedMessage {...messages.infoMessage} />{' '}
            {additionalSeatsMessage}
          </Text>
          <Box mb="24px">
            {exceedsSeats.admin && <SeatInfo seatType={'admin'} />}
            {exceedsSeats.moderator && <SeatInfo seatType={'moderator'} />}
          </Box>

          <BillingWarning mb="24px" />

          <Box display="flex">
            <Button
              onClick={handleConfirmClick}
              data-testid="confirm-button-text"
            >
              {formatMessage(messages.confirmButtonText)}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default InviteUsersWithSeatsModal;
