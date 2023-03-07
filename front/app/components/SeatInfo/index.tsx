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

// Intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

type SeatInfoType = {
  seatType: 'project_manager' | 'admin';
  width?: number;
};

const SeatInfo = ({ seatType, width = 516 }: SeatInfoType) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  if (!appConfiguration || !seats) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const maximumProjectManagers =
    appConfiguration.data.attributes.settings.core
      .maximum_project_moderators_number;
  const maximumSeatNumber =
    seatType === 'admin' ? maximumAdmins : maximumProjectManagers;
  const currentAdminSeats = seats.data.attributes.admins_number;
  const currentProjectManagerSeats =
    seats.data.attributes.project_moderators_number;
  const currentSeatNumber =
    seatType === 'admin' ? currentAdminSeats : currentProjectManagerSeats;
  const additionalSeats = currentSeatNumber - maximumSeatNumber;

  return (
    <Box
      width={`${width}px`}
      display="flex"
      flexDirection="column"
      padding="20px"
      bgColor={rgba(colors.teal400, 0.07)}
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        <Icon name="shield-checkered" fill={colors.teal300} />
        <Text color="teal700" ml="8px" variant="bodyM" fontWeight="bold">
          {formatMessage(messages.currentAdminSeats)}
        </Text>
      </Box>

      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" mr="24px">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Text color="teal700" mr="8px" variant="bodyS" my="0px">
              {formatMessage(messages.includedSeats)}
            </Text>
            <IconTooltip
              content={<FormattedMessage {...messages.includedSeatsToolTip} />}
            />
          </Box>
          <Text fontSize="xl" color="textPrimary" my="0px">
            {`${currentSeatNumber}/${maximumSeatNumber}`}
          </Text>
        </Box>

        {additionalSeats > 0 && (
          <>
            <Box mr="24px" border={`1px solid ${colors.divider}`} />

            <Box display="flex" flexDirection="column">
              <Box display="flex" flexDirection="row" alignItems="center">
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
        {seatType === 'project_manager' ? (
          <Text my="0px" variant="bodyS">
            <FormattedMessage
              {...messages.projectManagerSeatInfoMessage}
              values={{
                adminSeatsIncluded: (
                  <Text as="span" fontWeight="bold" variant="bodyS">
                    {formatMessage(
                      messages.projectManagerSeatsIncludedSubText,
                      { projectManagerSeats: maximumSeatNumber }
                    )}
                  </Text>
                ),
              }}
            />
          </Text>
        ) : (
          <Text my="0px" variant="bodyS">
            <FormattedMessage
              {...messages.adminSeatInfoMessage}
              values={{
                adminSeatsIncluded: (
                  <Text as="span" fontWeight="bold" variant="bodyS">
                    {formatMessage(messages.adminSeatsIncludedSubText, {
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

export default SeatInfo;
