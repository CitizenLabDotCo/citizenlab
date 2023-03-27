import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatInfo';
import SeatChangeSuccessModal from 'components/admin/SeatChangeSuccessModal';

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
  noOfCollaboratorSeatsToAdd: number;
}

const AddCollaboratorsModal = ({
  showModal,
  closeModal,
  addModerators,
  noOfCollaboratorSeatsToAdd,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!appConfiguration || !seats) return null;

  const maximumCollaborators =
    appConfiguration.data.attributes.settings.core.maximum_moderators_number;
  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;
  const hasReachedLimit =
    !isNil(maximumCollaborators) &&
    currentCollaboratorSeats >= maximumCollaborators;
  const buttonText = hasReachedLimit
    ? formatMessage(messages.buyAdditionalSeats, {
        noOfSeats: noOfCollaboratorSeatsToAdd,
      })
    : formatMessage(messages.confirmButtonText);

  return (
    <>
      <Modal
        opened={showModal}
        close={closeModal}
        header={
          <Text
            color="primary"
            my="8px"
            fontSize="l"
            fontWeight="bold"
            px="2px"
          >
            {formatMessage(messages.giveCollaboratorRights)}
          </Text>
        }
      >
        <Box display="flex" flexDirection="column" width="100%" p="32px">
          <Text color="textPrimary" fontSize="m" my="0px">
            {hasReachedLimit ? (
              <FormattedMessage
                {...messages.reachedLimitText}
                values={{
                  noOfSeats: noOfCollaboratorSeatsToAdd,
                }}
              />
            ) : (
              <FormattedMessage
                {...messages.confirmMessage}
                values={{
                  noOfPeople: noOfCollaboratorSeatsToAdd,
                }}
              />
            )}
          </Text>
          <Box py="32px">
            <SeatInfo seatType="collaborator" />
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
                setShowSuccessModal(true);
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </Modal>
      <SeatChangeSuccessModal
        showModal={showSuccessModal}
        closeModal={() => setShowSuccessModal(false)}
        hasPurchasedMoreSeats={hasReachedLimit}
        seatType="collaborator"
      />
    </>
  );
};

export default AddCollaboratorsModal;
