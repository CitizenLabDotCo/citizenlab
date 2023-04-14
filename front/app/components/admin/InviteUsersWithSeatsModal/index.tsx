import React, { useState } from 'react';

// Components
import { Box, Button, Text, Checkbox } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo, {
  SeatTypeMessageDescriptor,
  TSeatType,
} from 'components/SeatInfo';
import Error from 'components/UI/Error';
import SeatSetSuccess from 'components/admin/SeatSetSuccess';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

// Utils
import { isNil } from 'utils/helperUtils';
import { TSeatNumber } from 'api/app_configuration/types';
import BillingWarning from 'components/SeatInfo/BillingWarning';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  if (!appConfiguration || !seats) return null;

  const maximumSeatNumbers: SeatTypeTSeatNumber = {
    admin:
      appConfiguration?.data.attributes.settings.core.maximum_admins_number,
    moderator:
      appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
  };
  const maximumSeatNumber = maximumSeatNumbers[seatType];
  const currentSeatNumbers: SeatTypeNumber = {
    admin: seats.data.attributes.admins_number,
    moderator: seats.data.attributes.project_moderators_number,
  };
  const currentSeatNumber = currentSeatNumbers[seatType];
  const hasExceededPlanSeatLimit =
    !isNil(maximumSeatNumber) && currentSeatNumber > maximumSeatNumber;

  const seatTypeMessages: SeatTypeMessageDescriptor = {
    admin: messages.admin,
    moderator: messages.moderator,
  };
  const seatTypesMessages: SeatTypeMessageDescriptor = {
    admin: messages.admins,
    moderator: messages.moderators,
  };
  const seatTypeModalTitles: SeatTypeMessageDescriptor = {
    admin: messages.giveAdminRights,
    moderator: messages.giveModeratorRights,
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
    setShowSuccess(true);
  };

  const header = !showSuccess ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(seatTypeModalTitles[seatType])}
    </Text>
  ) : undefined;

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={() => {
            closeModal();
            setShowSuccess(false);
            setShowWarning(false);
            setHasAcknowledged(false);
          }}
          seatType="moderator"
          hasExceededPlanSeatLimit={hasExceededPlanSeatLimit}
        />
      ) : (
        <Box display="flex" flexDirection="column" p="32px">
          <Text color="textPrimary" mt="0" mb="24px">
            <FormattedMessage
              {...messages.infoMessage}
              values={{
                noOfUsers: noOfSeatsToAdd,
                seatType: formatMessage(seatTypeMessages[seatType]),
              }}
            />
          </Text>
          <Box mb="24px">
            <SeatInfo seatType={seatType} />
          </Box>

          <Box mb="24px">
            <BillingWarning />
          </Box>

          <Checkbox
            mb="24px"
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
            <Box mb="24px">
              <Error text={formatMessage(messages.acceptWarning)} />
            </Box>
          )}

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
