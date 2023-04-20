import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import {
  Title,
  Text,
  Box,
  Icon,
  Button,
} from '@citizenlab/cl2-component-library';
import {
  SeatTypeMessageDescriptor,
  TSeatType,
} from 'components/SeatBasedBilling/SeatInfo';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import { colors } from 'utils/styleUtils';

type SeatChangeSuccessModalProps = {
  closeModal: () => void;
  seatType: TSeatType;
  hasExceededPlanSeatLimit: boolean;
};

const SeatSetSuccess = ({
  closeModal,
  seatType,
  hasExceededPlanSeatLimit,
}: SeatChangeSuccessModalProps) => {
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const seatTypeMessages: SeatTypeMessageDescriptor = {
    admin: messages.admin,
    moderator: messages.manager,
  };
  const descriptionMessage =
    hasSeatBasedBillingEnabled && hasExceededPlanSeatLimit
      ? formatMessage(messages.reflectedMessage)
      : formatMessage(messages.rightsGranted, {
          seatType: formatMessage(seatTypeMessages[seatType]),
        });
  const titleMessage =
    hasSeatBasedBillingEnabled && hasExceededPlanSeatLimit
      ? messages.orderCompleted
      : messages.allDone;

  return (
    <Box p="30px" data-cy="e2e-seat-set-success-body">
      <Box display="flex" justifyContent="center">
        <Icon
          name="check-circle"
          fill={colors.green400}
          width="60px"
          height="60px"
        />
      </Box>
      <Title variant="h3" textAlign="center">
        {formatMessage(titleMessage)}
      </Title>
      <Text textAlign="center" fontSize="l">
        {descriptionMessage}
      </Text>
      <Box
        display="flex"
        mt="32px"
        width="100%"
        flexDirection="row"
        justifyContent="center"
      >
        <Button onClick={closeModal} data-cy="e2e-close-seat-success-button">
          {formatMessage(messages.close)}
        </Button>
      </Box>
    </Box>
  );
};

export default SeatSetSuccess;
