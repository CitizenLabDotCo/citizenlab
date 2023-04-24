import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import SeatSetSuccess from 'components/admin/SeatBasedBilling/SeatSetSuccess';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useExceedsSeats from 'hooks/useExceedsSeats';

// Utils
import { TSeatNumber } from 'api/app_configuration/types';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';

import { IInvitesNewSeats } from 'services/invites';

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

  const exceedsSeats = useExceedsSeats({
    newlyAddedAdminsNumber: newSeats.newly_added_admins_number,
    newlyAddedModeratorsNumber: newSeats.newly_added_moderators_number,
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

  if (exceedsSeats.all) {
    additionalSeatsMessage = formatMessage(
      messages.additionalAdminAndManagerSeats,
      {
        adminSeats: newSeats.newly_added_admins_number,
        managerSeats: newSeats.newly_added_moderators_number,
      }
    );
  } else if (exceedsSeats.admin) {
    additionalSeatsMessage = formatMessage(messages.additionalAdminSeats, {
      seats: newSeats.newly_added_admins_number,
    });
  } else {
    additionalSeatsMessage = formatMessage(messages.additionalManagerSeats, {
      seats: newSeats.newly_added_moderators_number,
    });
  }

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={() => {
            closeModal();
            setShowSuccess(false);
          }}
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
