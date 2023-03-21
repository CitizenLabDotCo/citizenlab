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
import { TSeatType } from 'api/seats/types';

// Intl
import messages from './messages';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

// Utils
import { isNil } from 'utils/helperUtils';

type Props = {
  seatType: TSeatType;
};

const SeatInfo = ({ seatType }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const maximumAdmins =
    appConfiguration?.data.attributes.settings.core.maximum_admins_number;
  const maximumProjectCollaborators =
    appConfiguration?.data.attributes.settings.core.maximum_moderators_number;
  const maximumSeatNumber = {
    admin: maximumAdmins,
    collaborator: maximumProjectCollaborators,
  }[seatType];

  // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
  if (isNil(maximumSeatNumber) || !seats || !appConfiguration) {
    return null;
  }

  const currentAdminSeats = seats.data.attributes.admins_number;
  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;
  let currentSeatNumber = {
    admin: currentAdminSeats,
    collaborator: currentCollaboratorSeats,
  }[seatType];
  const additionalSeats = currentSeatNumber - maximumSeatNumber;
  const seatTypeMessage: {
    [key in TSeatType]: MessageDescriptor;
  } = {
    admin: messages.currentAdminSeatsTitle,
    collaborator: messages.currentCollaboratorSeatsTitle,
  };
  const currentSeatTypeTitle = seatTypeMessage[seatType];
  const tooltipMessages: {
    [key in TSeatType]: MessageDescriptor;
  } = {
    admin: messages.includedAdminToolTip,
    collaborator: messages.includedCollaboratorToolTip,
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
      <Box display="flex" flexDirection="row" alignItems="center">
        <Icon name="shield-checkered" fill={colors.teal300} />
        <Text color="teal700" ml="8px" variant="bodyM" fontWeight="bold">
          {formatMessage(currentSeatTypeTitle)}
        </Text>
      </Box>

      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" mr="24px">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Text color="teal700" mr="8px" variant="bodyS" my="0px">
              {formatMessage(messages.includedSeats)}
            </Text>
            <IconTooltip content={<FormattedMessage {...tooltipMessage} />} />
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
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.additionalSeatsToolTip} />
                  }
                />
              </Box>
              <Text fontSize="xl" color="textPrimary" my="0px">
                {additionalSeats}
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Box mt="20px">
        {seatType === 'collaborator' ? (
          <Text my="0px" variant="bodyS">
            <FormattedMessage
              {...messages.collaboratorMessage}
              values={{
                adminSeatsIncluded: (
                  <Text as="span" fontWeight="bold" variant="bodyS">
                    {formatMessage(messages.collaboratorsIncludedSubText, {
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
              {...messages.adminMessage}
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
