import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatInfo';
import SeatChangeSuccess from 'components/admin/SeatChangeSuccess';

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
  const hasReachedOrIsOverLimit =
    !isNil(maximumCollaborators) &&
    currentCollaboratorSeats >= maximumCollaborators;
  const hasMoreSeats =
    !isNil(maximumCollaborators) &&
    currentCollaboratorSeats > maximumCollaborators;
  const buttonText = hasReachedOrIsOverLimit
    ? formatMessage(messages.buyAdditionalSeats, {
        noOfSeats: noOfCollaboratorSeatsToAdd,
      })
    : formatMessage(messages.confirmButtonText);

  const header = !showSuccessModal ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(messages.giveCollaboratorRights)}
    </Text>
  ) : undefined;

  return (
    <>
      <Modal opened={showModal} close={closeModal} header={header}>
        {showSuccessModal ? (
          <SeatChangeSuccess
            closeModal={closeModal}
            hasMoreSeats={hasMoreSeats}
            seatType="collaborator"
          />
        ) : (
          <Box display="flex" flexDirection="column" width="100%" p="32px">
            <Text color="textPrimary" fontSize="m" my="0px">
              {hasReachedOrIsOverLimit ? (
                <FormattedMessage
                  {...messages.hasReachedOrIsOverLimit}
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
                  setShowSuccessModal(true);
                }}
              >
                {buttonText}
              </Button>
            </Box>
          </Box>
        )}
      </Modal>
    </>
  );
};

export default AddCollaboratorsModal;
