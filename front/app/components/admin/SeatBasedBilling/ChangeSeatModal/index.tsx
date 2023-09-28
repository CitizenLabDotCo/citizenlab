import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatSetSuccess from '../SeatSetSuccess';

// Translation
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import messages from './messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useExceedsSeats from 'hooks/useExceedsSeats';

// Utils
import { isRegularUser, isAdmin } from 'utils/permissions/roles';

import { IUserData } from 'api/users/types';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';
import { getFullName } from 'utils/textUtils';

const getInfoText = (
  isUserAdmin: boolean,
  isChangingModeratorToNormalUser: boolean,
  hasExceededPlanSeatLimit: boolean
): MessageDescriptor => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  } else if (isChangingModeratorToNormalUser) {
    return messages.confirmSetManagerAsNormalUserQuestion;
  } else if (hasExceededPlanSeatLimit) {
    return messages.reachedLimitMessage;
  }

  return messages.confirmAdminQuestion;
};

const getButtonText = (
  isUserAdmin: boolean,
  isUserToChangeModerator: boolean,
  hasExceededPlanSeatLimit: boolean,
  hasSeatBasedBillingEnabled: boolean
): MessageDescriptor => {
  const buttonText = messages.confirm;

  if (isUserAdmin || isUserToChangeModerator || !hasSeatBasedBillingEnabled) {
    return buttonText;
  }

  return hasExceededPlanSeatLimit ? messages.buyOneAditionalSeat : buttonText;
};

interface Props {
  userToChangeSeat: IUserData;
  showModal: boolean;
  isChangingToNormalUser: boolean;
  closeModal: () => void;
  changeRoles: (user: IUserData, changeToNormalUser: boolean) => void;
}

const ChangeSeatModal = ({
  showModal,
  closeModal,
  userToChangeSeat,
  changeRoles,
  isChangingToNormalUser,
}: Props) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const isUserToChangeSeatAdmin = isAdmin({ data: userToChangeSeat });
  const isUserToChangeModerator = !isRegularUser({
    data: userToChangeSeat,
  });
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const isChangingModeratorToNormalUser =
    isChangingToNormalUser && isUserToChangeModerator;

  const exceedsSeats = useExceedsSeats()({
    newlyAddedAdminsNumber: 1,
  });

  const confirmChangeQuestion = getInfoText(
    isUserToChangeSeatAdmin,
    isChangingModeratorToNormalUser,
    exceedsSeats.admin
  );
  const buttonText = getButtonText(
    isUserToChangeSeatAdmin,
    isUserToChangeModerator,
    exceedsSeats.admin,
    hasSeatBasedBillingEnabled
  );

  const header = !showSuccess ? (
    <Box px="2px">
      <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
        {formatMessage(messages.changeUserRights)}
      </Text>
    </Box>
  ) : undefined;

  const resetModal = () => {
    closeModal();
    setShowSuccess(false);
  };

  return (
    <Modal opened={showModal} close={resetModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={resetModal}
          hasExceededPlanSeatLimit={exceedsSeats.admin}
          seatType="admin"
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          p="32px"
          data-cy="e2e-confirm-change-seat-body"
        >
          <Text color="textPrimary" mt="0" mb="24px">
            <FormattedMessage
              {...confirmChangeQuestion}
              values={{
                name: (
                  <Text as="span" fontWeight="bold" fontSize="m">
                    {getFullName(userToChangeSeat)}
                  </Text>
                ),
              }}
            />
          </Text>

          {!isChangingToNormalUser && (
            <Box mb="24px">
              <SeatInfo seatType="admin" />
            </Box>
          )}

          {!isChangingToNormalUser && <BillingWarning mb="24px" />}

          <Box display="flex">
            <Button
              autoFocus
              onClick={() => {
                changeRoles(userToChangeSeat, isChangingToNormalUser);
                if (!isChangingToNormalUser) {
                  setShowSuccess(true);
                } else {
                  closeModal();
                }
              }}
              data-cy="e2e-confirm-change-seat-button"
            >
              {formatMessage(buttonText)}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default ChangeSeatModal;
