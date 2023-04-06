import React from 'react';
import { rgba } from 'polished';

// Components
import {
  Box,
  Icon,
  Text,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';

// Hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

import { TSeatNumber } from 'api/app_configuration/types';

// Intl
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// Utils
import { isNil } from 'utils/helperUtils';

export type TSeatType = 'collaborator' | 'admin';

// Messages
export type SeatTypeMessageDescriptor = {
  [key in TSeatType]: MessageDescriptor;
};

export type SeatNumbersType = {
  [key in TSeatType]: TSeatNumber;
};

export type SeatInfoProps = {
  seatType: TSeatType;
};

const BillingInfo = ({ seatType }: SeatInfoProps) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  const maximumSeatNumbers: SeatNumbersType = {
    admin:
      appConfiguration?.data.attributes.settings.core.maximum_admins_number,
    collaborator:
      appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
  };
  const maximumSeatNumber = maximumSeatNumbers[seatType];

  const additionalSeatNumbers: SeatNumbersType = {
    admin:
      appConfiguration?.data.attributes.settings.core.additional_admins_number,
    collaborator:
      appConfiguration?.data.attributes.settings.core
        .additional_moderators_number,
  };
  const maximumAdditionalSeats = additionalSeatNumbers[seatType];

  // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
  if (isNil(maximumSeatNumber) || isNil(maximumAdditionalSeats) || !seats) {
    return null;
  }

  const usedSeats = {
    admin: seats.data.attributes.admins_number,
    collaborator: seats.data.attributes.project_moderators_number,
  }[seatType];

  const seatTypeMessage: SeatTypeMessageDescriptor = {
    admin: messages.adminSeats,
    collaborator: messages.collaboratorSeats,
  };
  const seatTypeTitle = seatTypeMessage[seatType];

  const seatTypeTooltipMessages: SeatTypeMessageDescriptor = {
    admin: messages.adminSeatsTooltip,
    collaborator: messages.collaboratorSeatsTooltip,
  };
  const seatTypeTooltipMessage = seatTypeTooltipMessages[seatType];

  const totalSeats = maximumAdditionalSeats + maximumSeatNumber;
  const remainingSeats = totalSeats - usedSeats;

  let totalSeatsBreakdownMessage = formatMessage(messages.seatsWithinPlanText);
  if (usedSeats > maximumSeatNumber) {
    // Any used seats exceeding the maximum set seat number are additional seats
    const noOfAdditionalSeats = usedSeats - maximumSeatNumber;
    totalSeatsBreakdownMessage = formatMessage(messages.seatsExceededPlanText, {
      noOfSeatsInPlan: maximumSeatNumber,
      noOfAdditionalSeats,
    });
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="20px"
      bgColor={rgba(colors.teal400, 0.07)}
    >
      <Box display="flex" alignItems="center">
        {seatType === 'admin' && (
          <Icon name="shield-checkered" fill={colors.teal300} mr="8px" />
        )}
        <Text color="teal700" variant="bodyM" fontWeight="bold" mr="4px">
          {formatMessage(seatTypeTitle)}
        </Text>
        <IconTooltip
          content={
            <FormattedMessage
              {...seatTypeTooltipMessage}
              values={{
                visitHelpCenter: (
                  <a
                    href={formatMessage(messages.rolesSupportPage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage {...messages.visitHelpCenter} />
                  </a>
                ),
              }}
            />
          }
        />
      </Box>

      <Box display="flex">
        <Box display="flex" flexDirection="column">
          <Text color="teal700" mr="8px" variant="bodyS" my="0px">
            {formatMessage(messages.remainingSeats)}
          </Text>
          <Text variant="bodyS" mt="4px">
            {remainingSeats}
          </Text>
        </Box>
        <Box mx="24px">
          <Text color="teal700" mr="8px" variant="bodyS" my="0px">
            {formatMessage(messages.usedSeats)}
          </Text>
          <Text variant="bodyS" my="4px">
            {usedSeats}
          </Text>
          <Text variant="bodyS" my="0px" color="coolGrey600">
            {formatMessage(messages.view)}
          </Text>
        </Box>
        <Box>
          <Box display="flex">
            <Text color="teal700" mr="8px" variant="bodyS" my="0px">
              {formatMessage(messages.totalSeats)}
            </Text>
            <IconTooltip
              content={<FormattedMessage {...messages.totalSeatsTooltip} />}
            />
          </Box>
          <Text variant="bodyS" my="4px">
            {totalSeats}
          </Text>
          <Text variant="bodyS" my="0px" color="coolGrey600">
            {totalSeatsBreakdownMessage}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default BillingInfo;
