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
import BillingWarning from 'components/SeatInfo/BillingWarning';

interface Props {
  showModal: boolean;
  closeModal: () => void;
  addModerators: () => void;
}

const AddModeratorsModal = ({
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
  const additionalModerators =
    appConfiguration?.data.attributes.settings.core
      .additional_moderators_number;
  const maximumModerators =
    appConfiguration?.data.attributes.settings.core.maximum_moderators_number;

  if (!appConfiguration || !seats) return null;

  const currentModeratorSeats = seats.data.attributes.moderators_number;

  const { hasReachedOrIsOverPlanSeatLimit, hasExceededPlanSeatLimit } =
    getExceededLimitInfo(
      hasSeatBasedBillingEnabled,
      currentModeratorSeats,
      additionalModerators,
      maximumModerators
    );

  const buttonText = hasReachedOrIsOverPlanSeatLimit
    ? formatMessage(messages.buyAdditionalSeats)
    : formatMessage(messages.confirmButtonText);

  const header = !showSuccess ? (
    <Text color="primary" my="8px" fontSize="l" fontWeight="bold" px="2px">
      {formatMessage(messages.giveManagerRights)}
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
          seatType="moderator"
          hasExceededPlanSeatLimit={hasExceededPlanSeatLimit}
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          p="32px"
          data-cy="e2e-add-moderators-body"
        >
          <Text color="textPrimary" fontSize="m" mt="0" mb="24px">
            <FormattedMessage
              {...(hasReachedOrIsOverPlanSeatLimit
                ? messages.hasReachedOrIsOverLimit
                : messages.confirmManagerRights)}
            />
          </Text>
          <Box mb="24px">
            <SeatInfo seatType="moderator" />
          </Box>

          <BillingWarning mb="24px" />

          <Box display="flex">
            <Button
              autoFocus
              onClick={() => {
                addModerators();
                setShowSuccess(true);
              }}
              data-cy="e2e-confirm-add-moderator"
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default AddModeratorsModal;
