import React from 'react';

import {
  Box,
  Icon,
  Text,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { useLocation } from 'utils/router';
import { RouteType } from 'routes';
import styled from 'styled-components';

import { TSeatNumber } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNil } from 'utils/helperUtils';

import messages from './messages';

export type TSeatType = 'moderator' | 'admin';

export type SeatTypeMessageDescriptor = {
  [key in TSeatType]: MessageDescriptor;
};

type SeatNumbersType = {
  [key in TSeatType]: TSeatNumber;
};

type SeatInfoProps = {
  seatType: TSeatType;
};

const StyledLink = styled(Link)`
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const SeatInfo = ({ seatType }: SeatInfoProps) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const adminsAndManagersLinks: RouteType[] = [
    '/admin/users/admins',
    '/admin/users/moderators',
  ];
  const isOnAdminsOrManagersPage = adminsAndManagersLinks.some((link) =>
    pathname.includes(link)
  );

  const maximumSeatNumbers: SeatNumbersType = {
    admin:
      appConfiguration?.data.attributes.settings.core.maximum_admins_number,
    moderator:
      appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
  };
  const maximumSeatNumber = maximumSeatNumbers[seatType];

  const additionalSeatNumbers: SeatNumbersType = {
    admin:
      appConfiguration?.data.attributes.settings.core.additional_admins_number,
    moderator:
      appConfiguration?.data.attributes.settings.core
        .additional_moderators_number,
  };
  const additionalSeats = additionalSeatNumbers[seatType];
  const linkTo =
    seatType === 'admin' ? '/admin/users/admins' : '/admin/users/moderators';

  // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
  if (isNil(maximumSeatNumber) || !seats) {
    return null;
  }

  const usedSeats = {
    admin: seats.data.attributes.admins_number,
    moderator: seats.data.attributes.moderators_number,
  }[seatType];
  const seatTypeTitleMessages: SeatTypeMessageDescriptor = {
    admin: messages.adminSeats,
    moderator: messages.managerSeats,
  };
  const seatTypeTitleMessage = seatTypeTitleMessages[seatType];
  const seatTypeTooltipMessages: SeatTypeMessageDescriptor = {
    admin: messages.adminSeatsTooltip,
    moderator: messages.managerSeatsTooltip,
  };
  const seatTypeTooltipMessage = seatTypeTooltipMessages[seatType];
  const totalSeats =
    typeof additionalSeats === 'number'
      ? maximumSeatNumber + additionalSeats
      : maximumSeatNumber;
  const remainingSeats = totalSeats - usedSeats;

  let totalSeatsBreakdownMessage = formatMessage(messages.seatsWithinPlanText);
  if (typeof additionalSeats === 'number' && additionalSeats > 0) {
    totalSeatsBreakdownMessage = formatMessage(messages.seatsExceededPlanText, {
      noOfSeatsInPlan: maximumSeatNumber,
      noOfAdditionalSeats: additionalSeats,
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
          {formatMessage(seatTypeTitleMessage)}
        </Text>
        <IconTooltip
          content={
            <FormattedMessage
              {...seatTypeTooltipMessage}
              values={{
                visitHelpCenter: (
                  <a
                    href={formatMessage(messages.rolesSupportPage2)}
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
          <Text
            fontSize="xl"
            mt="4px"
            data-cy={`e2e-${seatType}-remaining-seats`}
          >
            {remainingSeats}
          </Text>
        </Box>
        <Box mx="24px">
          <Text color="teal700" mr="8px" variant="bodyS" my="0px">
            {formatMessage(messages.usedSeats)}
          </Text>
          <Text fontSize="xl" my="4px" data-cy={`e2e-${seatType}-used-seats`}>
            {usedSeats}
          </Text>
          {!isOnAdminsOrManagersPage && usedSeats > 0 && (
            <StyledLink target="_blank" to={linkTo}>
              <Text variant="bodyXs" my="0px" color="coolGrey600">
                {formatMessage(messages.view)}
              </Text>
            </StyledLink>
          )}
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
          <Text my="4px" fontSize="xl" data-cy={`e2e-${seatType}-total-seats`}>
            {totalSeats}
          </Text>
          <Text variant="bodyXs" my="0px" color="coolGrey600">
            {totalSeatsBreakdownMessage}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default SeatInfo;
