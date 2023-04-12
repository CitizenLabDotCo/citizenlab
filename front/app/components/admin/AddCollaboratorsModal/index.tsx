import React, { useState } from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatInfo';
import SeatSetSuccess from 'components/admin/SeatSetSuccess';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';

// Utils
import { getExceededLimitInfo } from 'components/SeatInfo/utils';

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
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const { data: seats } = useSeats();
  const [showSuccess, setShowSuccess] = useState(false);
  const additionalCollaborators =
    appConfiguration?.data.attributes.settings.core
      .additional_moderators_number;
  const maximumCollaborators =
    appConfiguration?.data.attributes.settings.core.maximum_moderators_number;

  if (!appConfiguration || !seats) return null;

  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;

  const { hasReachedOrIsOverPlanSeatLimit, hasExceededPlanSeatLimit } =
    getExceededLimitInfo(
      hasSeatBasedBillingEnabled,
      currentCollaboratorSeats,
      additionalCollaborators,
      maximumCollaborators
    );

  const buttonText = hasReachedOrIsOverPlanSeatLimit
    ? formatMessage(messages.buyAdditionalSeats)
    : formatMessage(messages.confirmButtonText);

  const header = !showSuccess ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(messages.giveCollaboratorRights)}
    </Text>
  ) : undefined;

  return (
    <Modal opened={showModal} close={closeModal} header={header}>
      {showSuccess ? (
        <SeatSetSuccess
          closeModal={() => {
            setShowSuccess(false);
            closeModal();
          }}
          hasExceededPlanSeatLimit={hasExceededPlanSeatLimit}
          seatType="collaborator"
        />
      ) : (
        <Box display="flex" flexDirection="column" width="100%" p="32px">
          <Text color="textPrimary" fontSize="m" my="0px">
            <FormattedMessage
              {...(hasReachedOrIsOverPlanSeatLimit
                ? messages.hasReachedOrIsOverLimit
                : messages.confirmMessage)}
            />
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
              autoFocus
              width="auto"
              onClick={() => {
                addModerators();
                setShowSuccess(true);
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default AddCollaboratorsModal;
