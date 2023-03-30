import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatChangeSuccess from 'components/admin/SeatChangeSuccess';

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

import { IUserData } from 'services/users';
import { isAdmin } from 'services/permissions/roles';

const getInfoText = (
  isUserAdmin: boolean,
  hasExceededSetAdmins: boolean
): MessageDescriptor => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  } else if (hasExceededSetAdmins) {
    return messages.reachedLimitMessage;
  }

  return messages.confirmAdminQuestion;
};

const getButtonText = (
  isUserAdmin: boolean,
  hasExceededSetAdmins: boolean,
  hasSeatBasedBillingEnabled: boolean
): MessageDescriptor => {
  const buttonText = messages.confirm;

  if (isUserAdmin || !hasSeatBasedBillingEnabled) {
    return buttonText;
  }

  return hasExceededSetAdmins ? messages.buyOneAditionalSeat : buttonText;
};

interface Props {
  userToChangeSeat: IUserData;
  showModal: boolean;
  closeModal: () => void;
  toggleAdmin: () => void;
}

const ChangeSeatModal = ({
  showModal,
  closeModal,
  userToChangeSeat,
  toggleAdmin,
}: Props) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isUserAdmin = isAdmin({ data: userToChangeSeat });
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

  const hasExceededSetAdmins =
    !isNil(maximumAdmins) && currentAdminSeats >= maximumAdmins;
  const confirmChangeQuestion = getInfoText(isUserAdmin, hasExceededSetAdmins);
  const modalTitle = isUserAdmin
    ? messages.setAsNormalUser
    : messages.giveAdminRights;
  const buttonText = getButtonText(
    isUserAdmin,
    hasExceededSetAdmins,
    hasSeatBasedBillingEnabled
  );
  const header = !showSuccessModal ? (
    <Box px="2px">
      <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
        {formatMessage(modalTitle)}
      </Text>
    </Box>
  ) : undefined;

  return (
    <>
      <Modal opened={showModal} close={closeModal} header={header}>
        {showSuccessModal && (
          <Box display="flex" flexDirection="column" width="100%" p="32px">
            <Box>
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
              <Box py="32px">
                <SeatInfo seatType="admin" />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              width="100%"
              alignItems="center"
            >
              <Button
                width="auto"
                onClick={() => {
                  toggleAdmin();
                  // closeModal();
                  if (!isUserAdmin) {
                    setShowSuccessModal(true);
                  }
                }}
              >
                {formatMessage(buttonText)}
              </Button>
            </Box>
          </Box>
        )}
        {!isUserAdmin && showSuccessModal && (
          <SeatChangeSuccess
            closeModal={closeModal}
            hasPurchasedMoreSeats={hasExceededSetAdmins}
            seatType="admin"
          />
        )}
      </Modal>
    </>
  );
};

export default ChangeSeatModal;
