import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';
import SeatSetSuccess from 'components/admin/SeatBasedBilling/SeatSetSuccess';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

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

  const buttonText = formatMessage(messages.buyAdditionalSeats);

  const header = !showSuccess ? (
    <Text
      id="add-moderators-modal-title"
      color="primary"
      my="8px"
      fontSize="l"
      fontWeight="bold"
      px="2px"
    >
      {formatMessage(messages.giveManagerRights)}
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
      ariaLabelledBy="add-moderators-modal-title"
    >
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={resetModal}
          seatType="moderator"
          hasExceededPlanSeatLimit={true}
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          p="32px"
          data-cy="e2e-add-moderators-body"
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
