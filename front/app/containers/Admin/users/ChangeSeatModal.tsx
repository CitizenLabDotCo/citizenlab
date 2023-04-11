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
import { isNil } from 'utils/helperUtils';
import { isCollaborator, isAdmin } from 'services/permissions/roles';

import { IUserData } from 'services/users';

const getInfoText = (
  isUserAdmin: boolean,
  isChangingCollaboratorToNormalUser: boolean,
  hasReachedOrIsOverLimit: boolean
): MessageDescriptor => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  } else if (isChangingCollaboratorToNormalUser) {
    return messages.confirmSetCollaboratorAsNormalUserQuestion;
  } else if (hasReachedOrIsOverLimit) {
    return messages.reachedLimitMessage;
  }

  return messages.confirmAdminQuestion;
};

const getButtonText = (
  isUserAdmin: boolean,
  isUserToChangeCollaborator: boolean,
  hasReachedOrIsOverLimit: boolean,
  hasSeatBasedBillingEnabled: boolean
): MessageDescriptor => {
  const buttonText = messages.confirm;

  if (
    isUserAdmin ||
    isUserToChangeCollaborator ||
    !hasSeatBasedBillingEnabled
  ) {
    return buttonText;
  }

  return hasReachedOrIsOverLimit ? messages.buyOneAditionalSeat : buttonText;
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
  const isUserToChangeCollaborator = isCollaborator({ data: userToChangeSeat });
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  if (!appConfiguration || !seats) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const currentAdminSeats = seats.data.attributes.admins_number;

  const isChangingCollaboratorToNormalUser =
    isChangingToNormalUser && isUserToChangeCollaborator;
  const hasReachedOrIsOverLimit =
    !isNil(maximumAdmins) && currentAdminSeats >= maximumAdmins;
  const hasExceededSetSeats =
    !isNil(maximumAdmins) && currentAdminSeats > maximumAdmins;
  const confirmChangeQuestion = getInfoText(
    isUserToChangeSeatAdmin,
    isChangingCollaboratorToNormalUser,
    hasReachedOrIsOverLimit
  );
  const modalTitle = isChangingToNormalUser
    ? messages.setAsNormalUser
    : messages.giveAdminRights;
  const buttonText = getButtonText(
    isUserToChangeSeatAdmin,
    isUserToChangeCollaborator,
    hasReachedOrIsOverLimit,
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
          hasExceededSetSeats={hasExceededSetSeats}
          seatType="admin"
        />
      ) : (
        <Box display="flex" flexDirection="column" width="100%" p="32px">
          <Box pb="32px">
            <Text color="textPrimary" fontSize="m" my="0px">
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
              <Box pt="32px">
                <SeatInfo seatType="admin" />
              </Box>
            )}
          </Box>
          <Box display="flex" width="100%" alignItems="center">
            <Button
              autoFocus
              width="auto"
              onClick={() => {
                changeRoles(userToChangeSeat, isChangingToNormalUser);
                if (!isChangingToNormalUser) {
                  setShowSuccess(true);
                } else {
                  closeModal();
                }
              }}
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
