import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import useExceedsSeats from 'hooks/useExceedsSeats';

import { ChangingRoleType } from 'containers/Admin/users/_shared/UserManager/UsersTable/UsersTableRow';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import BillingWarning from 'components/admin/SeatBasedBilling/SeatInfo/BillingWarning';
import Modal from 'components/UI/Modal';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isRegularUser, isAdmin } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

import SeatSetSuccess from '../SeatSetSuccess';

import messages from './messages';

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
  hasExceededPlanSeatLimit: boolean
): MessageDescriptor => {
  const buttonText = messages.confirm;

  if (isUserAdmin || isUserToChangeModerator) {
    return buttonText;
  }

  return hasExceededPlanSeatLimit ? messages.buyOneAditionalSeat : buttonText;
};

interface Props {
  userToChangeSeat: IUserData;
  changingToRoleType?: ChangingRoleType;
  /**
   * Optional ref to return focus on close.
   * By default, focus returns to the control that opened the modal.
   * Use this ref if you want to return focus to another ref.
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
  closeModal: () => void;
  onConfirm: () => void;
}

const ChangeSeatModal = ({
  userToChangeSeat,
  returnFocusRef,
  changingToRoleType,
  closeModal,
  onConfirm,
}: Props) => {
  const isChangingToNormalUser = changingToRoleType === 'user';
  const [showSuccess, setShowSuccess] = useState(false);
  const isUserToChangeSeatAdmin = isAdmin({ data: userToChangeSeat });
  const isUserToChangeModerator = !isRegularUser({
    data: userToChangeSeat,
  });
  const { formatMessage } = useIntl();
  const isChangingModeratorToNormalUser =
    isChangingToNormalUser && isUserToChangeModerator;

  const { loading, checkIfUserExceedsSeats } = useExceedsSeats();

  if (loading) return null;

  const getWouldExceedAnySeats = () => {
    if (changingToRoleType === 'admin') {
      return checkIfUserExceedsSeats(userToChangeSeat, 'admin');
    }

    if (changingToRoleType === 'moderator') {
      return checkIfUserExceedsSeats(userToChangeSeat, 'moderator');
    }

    return false;
  };

  const wouldExceedAnySeats = getWouldExceedAnySeats();

  const confirmChangeQuestion = getInfoText(
    isUserToChangeSeatAdmin,
    isChangingModeratorToNormalUser,
    wouldExceedAnySeats
  );
  const buttonText = getButtonText(
    isUserToChangeSeatAdmin,
    isUserToChangeModerator,
    wouldExceedAnySeats
  );

  const header = !showSuccess ? (
    <Box px="2px">
      <Text
        id="change-seat-modal-title"
        color="primary"
        my="8px"
        fontSize="l"
        fontWeight="bold"
      >
        {formatMessage(messages.changeUserRights)}
      </Text>
    </Box>
  ) : undefined;

  const resetModal = () => {
    closeModal();
    setShowSuccess(false);
  };

  const seatType = changingToRoleType === 'admin' ? 'admin' : 'moderator';
  return (
    <Modal
      opened={!!changingToRoleType}
      close={resetModal}
      header={header}
      returnFocusRef={returnFocusRef}
      ariaLabelledBy="change-seat-modal-title"
    >
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={resetModal}
          hasExceededPlanSeatLimit={wouldExceedAnySeats}
          seatType={seatType}
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
              <SeatInfo seatType={seatType} />
            </Box>
          )}

          {!isChangingToNormalUser && <BillingWarning mb="24px" />}

          <Box display="flex">
            <Button
              autoFocus
              onClick={() => {
                onConfirm();
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
