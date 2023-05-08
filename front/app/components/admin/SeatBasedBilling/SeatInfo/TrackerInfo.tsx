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

// Types
import { SeatInfoProps, SeatNumbersType, SeatTypeMessageDescriptor } from '.';

// Intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// Utils
import { isNil } from 'utils/helperUtils';

const TrackerInfo = ({ seatType }: SeatInfoProps) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  const maximumSeatNumbers: SeatNumbersType = {
    admin:
      appConfiguration?.data.attributes.settings.core.maximum_admins_number,
    moderator:
      appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
  };
  const maximumSeatNumber = maximumSeatNumbers[seatType];

  // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
  if (isNil(maximumSeatNumber) || !seats) {
    return null;
  }

  let currentSeatNumber = {
    admin: seats.data.attributes.admins_number,
    moderator: seats.data.attributes.moderators_number,
  }[seatType];
  const additionalSeats = currentSeatNumber - maximumSeatNumber;
  const showAdditionalSeats = additionalSeats > 0;

  const seatTypeMessage: SeatTypeMessageDescriptor = {
    admin: messages.currentAdminSeatsTitle,
    moderator: messages.currentManagerSeatsTitle,
  };
  const currentSeatTypeTitle = seatTypeMessage[seatType];
  const tooltipMessages: SeatTypeMessageDescriptor = {
    admin: messages.includedAdminToolTip,
    moderator: messages.includedManagerToolTip,
  };
  const tooltipMessage = tooltipMessages[seatType];

  // Show maximum number of seats if user has used more for this value
  if (currentSeatNumber >= maximumSeatNumber) {
    currentSeatNumber = maximumSeatNumber;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="20px"
      bgColor={rgba(colors.teal400, 0.07)}
    >
      <Box display="flex" alignItems="center">
        <Icon name="shield-checkered" fill={colors.teal300} />
        <Text color="teal700" ml="8px" variant="bodyM" fontWeight="bold">
          {formatMessage(currentSeatTypeTitle)}
        </Text>
      </Box>

      <Box display="flex">
        <Box display="flex" flexDirection="column" mr="24px">
          <Box display="flex" alignItems="center">
            <Text color="teal700" mr="8px" variant="bodyS" my="0px">
              {formatMessage(messages.includedSeats)}
            </Text>
            <IconTooltip content={<FormattedMessage {...tooltipMessage} />} />
          </Box>
          <Text fontSize="xl" color="textPrimary" my="0px">
            {`${currentSeatNumber}/${maximumSeatNumber}`}
          </Text>
        </Box>

        {showAdditionalSeats && (
          <>
            <Box mr="24px" border={`1px solid ${colors.divider}`} />

            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center">
                <Text color="teal700" mr="8px" variant="bodyS" my="0px">
                  {formatMessage(messages.additionalSeats)}
                </Text>
              </Box>
              <Text fontSize="xl" color="textPrimary" my="0px">
                {additionalSeats}
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Box mt="20px">
        {seatType === 'moderator' ? (
          <Text my="0px" variant="bodyS">
            <FormattedMessage
              {...messages.managerInfoTextWithoutBilling}
              values={{
                managerSeatsIncluded: (
                  <Text as="span" fontWeight="bold" variant="bodyS">
                    {formatMessage(messages.managersIncludedText, {
                      managerSeats: maximumSeatNumber,
                    })}
                  </Text>
                ),
              }}
            />
          </Text>
        ) : (
          <Text my="0px" variant="bodyS">
            <FormattedMessage
              {...messages.adminInfoTextWithoutBilling}
              values={{
                adminSeatsIncluded: (
                  <Text as="span" fontWeight="bold" variant="bodyS">
                    {formatMessage(messages.adminSeatsIncludedText, {
                      adminSeats: maximumSeatNumber,
                    })}
                  </Text>
                ),
              }}
            />
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default TrackerInfo;
