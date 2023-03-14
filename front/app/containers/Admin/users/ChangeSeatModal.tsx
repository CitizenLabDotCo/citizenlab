import React from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// Translation
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import SeatInfo from 'components/SeatInfo';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

import { IUserData } from 'services/users';

const getInfoText = (
  isUserAdmin: boolean,
  maximumAdmins: number | null,
  currentAdminSeats: number
): MessageDescriptor => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  } else if (maximumAdmins !== null && currentAdminSeats >= maximumAdmins) {
    return messages.reachedLimitMessage;
  }

  return messages.confirmAdminQuestion;
};

interface Props {
  user: IUserData;
  showModal: boolean;
  isUserAdmin: boolean;
  closeModal: () => void;
  toggleAdmin: () => void;
}

const ChangeSeatModal = ({
  showModal,
  closeModal,
  user,
  toggleAdmin,
  isUserAdmin,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  if (!appConfiguration || !seats) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const currentAdminSeats = seats.data.attributes.admins_number;

  const confirmChangeQuestion = getInfoText(
    isUserAdmin,
    maximumAdmins,
    currentAdminSeats
  );
  const modalTitle = isUserAdmin
    ? messages.setAsNormalUser
    : messages.giveAdminRights;

  return (
    <Modal
      opened={showModal}
      close={closeModal}
      header={
        <Box px="2px">
          <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
            {formatMessage(modalTitle)}
          </Text>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" width="100%" p="32px">
        <Box>
          <Text color="textPrimary" fontSize="m" my="0px">
            <FormattedMessage
              {...confirmChangeQuestion}
              values={{
                name: (
                  <Text as="span" fontWeight="bold" fontSize="m">
                    {`${user.attributes.first_name} ${user.attributes.last_name}`}
                  </Text>
                ),
              }}
            />
          </Text>
          <Box py="32px">
            <SeatInfo seatType="admin" width={null} />
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
              closeModal();
            }}
          >
            {formatMessage(messages.confirm)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChangeSeatModal;
