import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatBasedBilling/SeatInfo';
import SeatSetSuccess from 'components/SeatBasedBilling/SeatSetSuccess';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// Utils
import BillingWarning from 'components/SeatBasedBilling/SeatInfo/BillingWarning';
import useExceedsSeats from 'hooks/useExceedsSeats';

interface Props {
  showModal: boolean;
  closeModal: () => void;
  addModerators: () => void;
}

const AddModeratorsModal = ({
  showModal,
  closeModal,
  addModerators,
}: Props) => {
  const { formatMessage } = useIntl();
  const [showSuccess, setShowSuccess] = useState(false);

  const exceedsSeats = useExceedsSeats()({
    newlyAddedModeratorsNumber: 1,
  });

  const buttonText = exceedsSeats.moderator
    ? formatMessage(messages.buyAdditionalSeats)
    : formatMessage(messages.confirmButtonText);

  const header = !showSuccess ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(messages.giveManagerRights)}
    </Text>
  ) : undefined;

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={() => {
            setShowSuccess(false);
            closeModal();
          }}
          seatType="moderator"
          hasExceededPlanSeatLimit={exceedsSeats.moderator}
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          p="32px"
          data-cy="e2e-add-moderators-body"
        >
          <Text color="textPrimary" fontSize="m" mt="0" mb="24px">
            <FormattedMessage
              {...(exceedsSeats.moderator
                ? messages.hasReachedOrIsOverLimit
                : messages.confirmManagerRights)}
            />
          </Text>
          <Box mb="24px">
            <SeatInfo seatType="moderator" />
          </Box>

          <BillingWarning mb="24px" />

          <Box display="flex">
            <Button
              autoFocus
              onClick={() => {
                addModerators();
                setShowSuccess(true);
              }}
              data-cy="e2e-confirm-add-moderator"
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default AddModeratorsModal;
