import React, { useState } from 'react';

// Components
import { Box, Button, Text, Checkbox } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo, {
  SeatTypeMessageDescriptor,
  TSeatType,
} from 'components/SeatInfo';
import Error from 'components/UI/Error';
import SeatChangeSuccess from 'components/admin/SeatChangeSuccess';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

// Utils
import { isNil } from 'utils/helperUtils';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  if (!appConfiguration || !seats) return null;

  const maximumSeatNumber = {
    admin:
      appConfiguration?.data.attributes.settings.core.maximum_admins_number,
    collaborator:
      appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
  }[seatType];
  const currentSeatNumber = {
    admin: seats.data.attributes.admins_number,
    collaborator: seats.data.attributes.project_moderators_number,
  }[seatType];
  const hasExceededSetSeats =
    !isNil(maximumSeatNumber) && currentSeatNumber > maximumSeatNumber;

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
    inviteUsers();
    setShowSuccessModal(true);
  };

  const header = !showSuccessModal ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(seatTypeModalTitles[seatType])}
    </Text>
  ) : undefined;

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccessModal ? (
        <SeatChangeSuccess
          closeModal={() => {
            closeModal();
            setShowSuccessModal(false);
            setShowWarning(false);
            setHasAcknowledged(false);
          }}
          hasExceededSetSeats={hasExceededSetSeats}
          seatType="collaborator"
        />
      ) : (
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
      )}
    </Modal>
  );
};

export default InviteUsersWithSeatsModal;
