import React, { useState } from 'react';

// Components
import { Box, Button, Text, Checkbox } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo, { TSeatType } from 'components/SeatInfo';
import Error from 'components/UI/Error';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

import { SeatTypeMessageDescriptor } from 'components/SeatInfo/SeatBillingInfo';

interface InviteUsersWithSeatsModalProps {
  showModal: boolean;
  closeModal: () => void;
  inviteUsers: () => void;
  noOfSeatsToAdd: number;
  seatType: TSeatType;
}

const InviteUsersWithSeatsModal = ({
  showModal,
  closeModal,
  inviteUsers,
  noOfSeatsToAdd,
  seatType,
}: InviteUsersWithSeatsModalProps) => {
  const { formatMessage } = useIntl();
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const seatTypeMessages: SeatTypeMessageDescriptor = {
    admin: messages.admin,
    collaborator: messages.collaborator,
  };
  const seatTypesMessages: SeatTypeMessageDescriptor = {
    admin: messages.admins,
    collaborator: messages.collaborators,
  };
  const seatTypeModalTitles: SeatTypeMessageDescriptor = {
    admin: messages.giveAdminRights,
    collaborator: messages.giveCollaboratorRights,
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setShowWarning(hasAcknowledged);
    setHasAcknowledged(!hasAcknowledged);
  };

  const handleConfirmClick = () => {
    if (!hasAcknowledged) {
      setShowWarning(true);
      return;
    }
    closeModal();
    inviteUsers();
  };

  return (
    <Modal
      opened={showModal}
      close={closeModal}
      header={
        <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
          {formatMessage(seatTypeModalTitles[seatType])}
        </Text>
      }
    >
      <Box display="flex" flexDirection="column" width="100%" p="32px">
        <Text color="textPrimary" fontSize="m" my="0px">
          <FormattedMessage
            {...messages.infoMessage}
            values={{
              noOfUsers: noOfSeatsToAdd,
              seatType: formatMessage(seatTypeMessages[seatType]),
            }}
          />
        </Text>
        <Box py="32px">
          <SeatInfo seatType={seatType} />
        </Box>

        <Checkbox
          checked={hasAcknowledged}
          onChange={onChange}
          label={
            <Text color="blue500" my="0px">
              {formatMessage(messages.billingAcknowledgement, {
                seatTypes: formatMessage(seatTypesMessages[seatType]),
              })}
            </Text>
          }
        />

        {showWarning && (
          <Box mt="12px">
            <Error text={formatMessage(messages.acceptWarning)} />
          </Box>
        )}

        <Box display="flex" mt="32px">
          <Button
            onClick={handleConfirmClick}
            data-testid="confirm-button-text"
          >
            {formatMessage(messages.confirmButtonText)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InviteUsersWithSeatsModal;
