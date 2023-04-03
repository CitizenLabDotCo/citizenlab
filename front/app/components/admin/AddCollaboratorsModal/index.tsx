import React from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatInfo';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

// Utils
import { isNil } from 'utils/helperUtils';

interface Props {
  showModal: boolean;
  closeModal: () => void;
  addModerators: () => void;
}

const AddCollaboratorsModal = ({
  showModal,
  closeModal,
  addModerators,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  if (!appConfiguration || !seats) return null;

  const maximumCollaborators =
    appConfiguration.data.attributes.settings.core.maximum_moderators_number;
  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;
  const hasReachedLimit =
    !isNil(maximumCollaborators) &&
    currentCollaboratorSeats >= maximumCollaborators;
  const buttonText = hasReachedLimit
    ? formatMessage(messages.buyAdditionalSeats)
    : formatMessage(messages.confirmButtonText);

  return (
    <Modal
      opened={showModal}
      close={closeModal}
      header={
        <Box px="2px">
          <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
            {formatMessage(messages.giveCollaboratorRights)}
          </Text>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" width="100%" p="32px">
        <Box>
          <Text color="textPrimary" fontSize="m" my="0px">
            <FormattedMessage
              {...(hasReachedLimit
                ? messages.reachedLimitText
                : messages.confirmMessage)}
            />
          </Text>
          <Box py="32px">
            <SeatInfo seatType="collaborator" />
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
              addModerators();
              closeModal();
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddCollaboratorsModal;
