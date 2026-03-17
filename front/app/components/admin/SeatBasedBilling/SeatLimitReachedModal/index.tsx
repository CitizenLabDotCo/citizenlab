import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';
import SeatSetSuccess from 'components/admin/SeatBasedBilling/SeatSetSuccess';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  seatType: TSeatType;
  showModal: boolean;
  closeModal: () => void;
  addModerators: () => void;
}

const HEADER_MESSAGE_PER_SEAT_TYPE = {
  admin: messages.giveAdminRights,
  moderator: messages.giveManagerRights,
} as const;

const SeatLimitReachedModal = ({
  seatType,
  showModal,
  closeModal,
  addModerators,
}: Props) => {
  const { formatMessage } = useIntl();
  const [showSuccess, setShowSuccess] = useState(false);

  const buttonText = formatMessage(messages.buyAdditionalSeats);

  const header = !showSuccess ? (
    <Text
      id="seat-limit-reached-modal-title"
      color="primary"
      my="8px"
      fontSize="l"
      fontWeight="bold"
      px="2px"
    >
      {formatMessage(HEADER_MESSAGE_PER_SEAT_TYPE[seatType])}
    </Text>
  ) : undefined;

  const resetModal = () => {
    closeModal();
    setShowSuccess(false);
  };

  return (
    <Modal
      opened={showModal}
      close={resetModal}
      header={header}
      ariaLabelledBy="seat-limit-reached-modal-title"
    >
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={resetModal}
          seatType={seatType}
          hasExceededPlanSeatLimit={true}
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          p="32px"
          data-cy="seat-limit-reached-body"
        >
          <Text color="textPrimary" fontSize="m" mt="0" mb="24px">
            <FormattedMessage {...messages.hasReachedOrIsOverLimit} />
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
              data-cy="confirm-add-seat"
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default SeatLimitReachedModal;
