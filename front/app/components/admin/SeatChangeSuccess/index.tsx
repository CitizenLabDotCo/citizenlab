import React from 'react';

// components
import {
  Title,
  Text,
  Box,
  Icon,
  Button,
} from '@citizenlab/cl2-component-library';
import { TSeatType } from 'components/SeatInfo';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import { colors } from 'utils/styleUtils';

type SeatChangeSuccessModalProps = {
  closeModal: () => void;
  seatType: TSeatType;
  hasPurchasedMoreSeats: boolean;
};

const SeatChangeSuccess = ({
  closeModal,
  seatType,
  hasPurchasedMoreSeats,
}: SeatChangeSuccessModalProps) => {
  const { formatMessage } = useIntl();
  const descriptionMessage = hasPurchasedMoreSeats
    ? formatMessage(messages.reflectedMessage)
    : formatMessage(messages.rightsGranted, {
        seatType: formatMessage(messages[seatType]),
      });

  return (
    <Box p="30px">
      <Box display="flex" justifyContent="center">
        <Icon
          name="check-circle"
          fill={colors.green400}
          width="60px"
          height="60px"
        />
      </Box>
      <Title variant="h3" textAlign="center">
        {formatMessage(messages.allDone)}
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
        <Button onClick={closeModal}>{formatMessage(messages.close)}</Button>
      </Box>
    </Box>
  );
};

export default SeatChangeSuccess;
