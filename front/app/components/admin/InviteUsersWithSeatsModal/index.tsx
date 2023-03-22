import React, { useState } from 'react';

// Components
import { Box, Button, Text, Checkbox } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo, {
  SeatTypeMessageDescriptor,
  TSeatType,
} from 'components/SeatInfo';
import Error from 'components/UI/Error';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

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

  return (
    <Modal
      opened={showModal}
      close={closeModal}
      header={
        <Box px="2px">
          <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
            {formatMessage(seatTypeModalTitles[seatType])}
          </Text>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" width="100%" p="32px">
        <Box>
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
        </Box>

        <Box>
          <Checkbox
            checked={hasAcknowledged}
            onChange={onChange}
            label={
              <Text color="blue500" my="0px">
                {formatMessage(messages.acknowledgement, {
                  seatTypes: formatMessage(seatTypesMessages[seatType]),
                })}
              </Text>
            }
          />
        </Box>

        {showWarning && (
          <Box mt="12px">
            <Error text={formatMessage(messages.acceptWarning)} />
          </Box>
        )}

        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
          mt="32px"
        >
          <Button
            width="auto"
            onClick={() => {
              closeModal();
              inviteUsers();
            }}
          >
            {formatMessage(messages.confirmButtonText)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InviteUsersWithSeatsModal;
