import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatSetSuccess from 'components/admin/SeatSetSuccess';

// Translation
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import SeatInfo from 'components/SeatInfo';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';

// Utils
import { isRegularUser, isAdmin } from 'services/permissions/roles';
import { getExceededLimitInfo } from 'components/SeatInfo/utils';

import { IUserData } from 'services/users';
import BillingWarning from 'components/SeatInfo/BillingWarning';

const getInfoText = (
  isUserAdmin: boolean,
  isChangingModeratorToNormalUser: boolean,
  hasReachedOrIsOverPlanSeatLimit: boolean
): MessageDescriptor => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  } else if (isChangingModeratorToNormalUser) {
    return messages.confirmSetManagerAsNormalUserQuestion;
  } else if (hasReachedOrIsOverPlanSeatLimit) {
    return messages.reachedLimitMessage;
  }

  return messages.confirmAdminQuestion;
};

const getButtonText = (
  isUserAdmin: boolean,
  isUserToChangeModerator: boolean,
  hasReachedOrIsOverPlanSeatLimit: boolean,
  hasSeatBasedBillingEnabled: boolean
): MessageDescriptor => {
  const buttonText = messages.confirm;

  if (isUserAdmin || isUserToChangeModerator || !hasSeatBasedBillingEnabled) {
    return buttonText;
  }

  return hasReachedOrIsOverPlanSeatLimit
    ? messages.buyOneAditionalSeat
    : buttonText;
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
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const maximumAdmins =
    appConfiguration?.data.attributes.settings.core.maximum_admins_number;
  if (!appConfiguration || !seats) return null;

  const currentAdminSeats = seats.data.attributes.admins_number;

  const additionalAdmins =
    appConfiguration?.data.attributes.settings.core.additional_admins_number;
  const isChangingModeratorToNormalUser =
    isChangingToNormalUser && isUserToChangeModerator;

  const { hasReachedOrIsOverPlanSeatLimit, hasExceededPlanSeatLimit } =
    getExceededLimitInfo(
      hasSeatBasedBillingEnabled,
      currentAdminSeats,
      additionalAdmins,
      maximumAdmins
    );

  const confirmChangeQuestion = getInfoText(
    isUserToChangeSeatAdmin,
    isChangingModeratorToNormalUser,
    hasReachedOrIsOverPlanSeatLimit
  );
  const modalTitle = isChangingToNormalUser
    ? messages.setAsNormalUser
    : messages.giveAdminRights;
  const buttonText = getButtonText(
    isUserToChangeSeatAdmin,
    isUserToChangeModerator,
    hasReachedOrIsOverPlanSeatLimit,
    hasSeatBasedBillingEnabled
  );

  const header = !showSuccess ? (
    <Box px="2px">
      <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
        {formatMessage(modalTitle)}
      </Text>
    </Box>
  ) : undefined;

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={() => {
            closeModal();
            setShowSuccess(false);
          }}
          hasExceededPlanSeatLimit={hasExceededPlanSeatLimit}
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
                    {`${userToChangeSeat.attributes.first_name} ${userToChangeSeat.attributes.last_name}`}
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
