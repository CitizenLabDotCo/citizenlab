import React from 'react';

import {
  Box,
  colors,
  Icon,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSeats from 'api/seats/useSeats';

import useTotalSeats from 'hooks/useTotalSeats';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';
import { useLocation } from 'utils/router';

import messages from './messages';

export type TSeatType = 'moderator' | 'admin';

export type SeatTypeMessageDescriptor = {
  [key in TSeatType]: MessageDescriptor;
};

interface Props {
  seatType: TSeatType;
  mb?: string;
}

const TOTAL_SEAT_MESSAGES = {
  admin: messages.totalAdminSeats,
  moderator: messages.totalManagerSeats,
};

const SEATS_OVERVIEW_PAGE = '/admin/users/seats';

const StyledLink = typedStyled(Link)`
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const SeatInfo = ({ seatType, mb }: Props) => {
  const totalSeatsObject = useTotalSeats();
  const { data: seats } = useSeats();
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { data: authUser } = useAuthUser();

  if (!totalSeatsObject || !seats) return null;

  const isOnSeatsOverviewPage = pathname.includes(SEATS_OVERVIEW_PAGE);
  const showLink = !isOnSeatsOverviewPage && isAdmin(authUser);

  const totalSeats =
    seatType === 'admin'
      ? totalSeatsObject.totalAdminSeats
      : totalSeatsObject.totalModeratorSeats;

  const seatAttributes = seats.data.attributes;
  const assignedSeats =
    seatType === 'admin'
      ? seatAttributes.admins_number
      : seatAttributes.moderators_number;

  // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
  if (!totalSeats) {
    return null;
  }

  return (
    <Box
      w="100%"
      maxWidth="800px"
      border={`1px solid ${colors.borderLight}`}
      borderRadius={stylingConsts.borderRadius}
      px="20px"
      py="12px"
      mb={mb}
    >
      <Box justifyContent="space-between" display="flex" alignItems="center">
        <Box display="flex" alignItems="center" data-cy="total-seats">
          {seatType === 'admin' && (
            <Icon
              name="shield-checkered"
              mr="4px"
              fill={colors.teal500}
              height="20px"
              transform="translateX(-4px)"
            />
          )}
          {formatMessage(TOTAL_SEAT_MESSAGES[seatType], { totalSeats })}
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            mr="20px"
            display="flex"
            alignItems="center"
            data-cy="assigned-seats"
          >
            <Icon
              name="check-circle"
              mr="4px"
              fill={colors.teal500}
              height="18px"
            />
            {formatMessage(messages.assignedSeats, { assignedSeats })}
          </Box>
          <Box display="flex" alignItems="center" data-cy="available-seats">
            <Icon
              name="dotted-circle"
              mr="4px"
              fill={colors.teal500}
              height="18px"
            />
            {formatMessage(messages.availableSeats, {
              availableSeats: totalSeats - assignedSeats,
            })}
          </Box>
        </Box>
      </Box>
      {showLink && (
        <Box mt="12px">
          <StyledLink target="_blank" to="/$locale/admin/users/seats">
            <Text variant="bodyXs" my="0px" color="coolGrey600">
              {formatMessage(messages.goToSeatsOverview)}
            </Text>
          </StyledLink>
        </Box>
      )}
    </Box>
  );
};

export default SeatInfo;
