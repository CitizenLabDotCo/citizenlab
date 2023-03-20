import React from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import SeatInfo from 'components/SeatInfo';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

// Utils
import { isNil } from 'utils/helperUtils';

interface Props {
  // userToChangeSeat: IUserData;
  showModal: boolean;
  closeModal: () => void;
  addModerators: () => void;
  selectedCollaborators: number;
}

const AddCollaboratorsModal = ({
  showModal,
  closeModal,
  addModerators,
  selectedCollaborators,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  if (!appConfiguration || !seats) return null;

  const maximumCollaborators =
    appConfiguration.data.attributes.settings.core
      .maximum_project_moderators_number;
  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;

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
            {!isNil(maximumCollaborators) &&
            currentCollaboratorSeats >= maximumCollaborators ? (
              <FormattedMessage
                {...messages.reachedLimitMessage}
                values={{
                  noOfSeats: selectedCollaborators,
                }}
              />
            ) : (
              <FormattedMessage
                {...messages.confirmMessage}
                values={{
                  noOfPeople: selectedCollaborators,
                }}
              />
            )}
          </Text>
          <Box py="32px">
            <SeatInfo seatType="project_manager" width={null} />
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
            {formatMessage(messages.buyAdditionalSeats, {
              noOfSeats: selectedCollaborators,
            })}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddCollaboratorsModal;
