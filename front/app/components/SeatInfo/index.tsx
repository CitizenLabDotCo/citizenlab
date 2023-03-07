import React from 'react';

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

// Intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { rgba } from 'polished';

type SeatInfoType = {
  seatType: 'project_manager' | 'admin';
  width?: number;
};

const SeatInfo = ({ seatType, width = 516 }: SeatInfoType) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const maximumProjectManagers =
    appConfiguration.data.attributes.settings.core
      .maximum_project_moderators_number;
  const maximumNumber =
    seatType === 'admin' ? maximumAdmins : maximumProjectManagers;

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
            {`6/${maximumNumber}`}
          </Text>
        </Box>

        <Box mr="24px" border={`1px solid ${colors.divider}`} />

        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Text color="teal700" mr="8px" variant="bodyS" my="0px">
              {formatMessage(messages.additionalSeats)}
            </Text>
            <IconTooltip
              content={
                <FormattedMessage {...messages.additionalSeatsToolTip} />
              }
            />
          </Box>
          <Text fontSize="xl" color="textPrimary" my="0px">
            0
          </Text>
        </Box>
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
                      { projectManagerSeats: maximumNumber }
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
                      adminSeats: maximumNumber,
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
