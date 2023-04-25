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
  newlyAddedAdminsNumber: number;
  newlyAddedModeratorsNumber: number;
}

const InviteUsersWithSeatsModal = ({
  showModal,
  closeModal,
  inviteUsers,
  newlyAddedAdminsNumber,
  newlyAddedModeratorsNumber,
}: InviteUsersWithSeatsModalProps) => {
  const { formatMessage } = useIntl();
  const [showSuccess, setShowSuccess] = useState(false);

  const exceedsSeats = useExceedsSeats({
    newlyAddedAdminsNumber,
    newlyAddedModeratorsNumber,
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
        adminSeats: newlyAddedAdminsNumber,
        managerSeats: newlyAddedModeratorsNumber,
      }
    );
  } else if (exceedsSeats.admin) {
    additionalSeatsMessage = formatMessage(messages.additionalAdminSeats, {
      seats: newlyAddedAdminsNumber,
    });
  } else {
    additionalSeatsMessage = formatMessage(messages.additionalManagerSeats, {
      seats: newlyAddedModeratorsNumber,
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
