// import React from 'react';

// import {
//   Box,
//   Icon,
//   Text,
//   IconTooltip,
//   colors,
// } from '@citizenlab/cl2-component-library';
// import { rgba } from 'polished';
// import { useLocation } from 'react-router-dom';
// import { RouteType } from 'routes';
// import styled from 'styled-components';

// import { TSeatNumber } from 'api/app_configuration/types';
// import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
// import useSeats from 'api/seats/useSeats';

// import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
// import Link from 'utils/cl-router/Link';
// import { isNil } from 'utils/helperUtils';

// import messages from './messages';

// type SeatNumbersType = {
//   [key in TSeatType]: TSeatNumber;
// };

// type SeatInfoProps = {
//   seatType: TSeatType;
// };

// const StyledLink = styled(Link)`
//   text-decoration: underline;

//   &:hover {
//     text-decoration: underline;
//   }
// `;

// const SEATS_OVERVIEW_PAGE: RouteType = '/admin/users/seats';

// const SeatInfo = ({ seatType }: SeatInfoProps) => {
//   const { formatMessage } = useIntl();
//   const { pathname } = useLocation();
//   const { data: appConfiguration } = useAppConfiguration();
//   const { data: seats } = useSeats();

//   const isOnSeatsOverviewPage = pathname.includes(SEATS_OVERVIEW_PAGE);

//   const maximumSeatNumbers: SeatNumbersType = {
//     admin:
//       appConfiguration?.data.attributes.settings.core.maximum_admins_number,
//     moderator:
//       appConfiguration?.data.attributes.settings.core.maximum_moderators_number,
//   };
//   const maximumSeatNumber = maximumSeatNumbers[seatType];

//   const additionalSeatNumbers: SeatNumbersType = {
//     admin:
//       appConfiguration?.data.attributes.settings.core.additional_admins_number,
//     moderator:
//       appConfiguration?.data.attributes.settings.core
//         .additional_moderators_number,
//   };
//   const additionalSeats = additionalSeatNumbers[seatType];

//   // Maximum seat number being null means that there are unlimited seats so we don't show the seat info
//   if (isNil(maximumSeatNumber) || !seats) {
//     return null;
//   }

//   const usedSeats = {
//     admin: seats.data.attributes.admins_number,
//     moderator: seats.data.attributes.moderators_number,
//   }[seatType];
//   const seatTypeTitleMessages: SeatTypeMessageDescriptor = {
//     admin: messages.adminSeats,
//     moderator: messages.managerSeats,
//   };
//   const seatTypeTitleMessage = seatTypeTitleMessages[seatType];
//   const seatTypeTooltipMessages: SeatTypeMessageDescriptor = {
//     admin: messages.adminSeatsTooltip,
//     moderator: messages.managerSeatsTooltip,
//   };
//   const seatTypeTooltipMessage = seatTypeTooltipMessages[seatType];
//   const totalSeats =
//     typeof additionalSeats === 'number'
//       ? maximumSeatNumber + additionalSeats
//       : maximumSeatNumber;
//   const remainingSeats = totalSeats - usedSeats;

//   let totalSeatsBreakdownMessage = formatMessage(messages.seatsWithinPlanText);
//   if (typeof additionalSeats === 'number' && additionalSeats > 0) {
//     totalSeatsBreakdownMessage = formatMessage(messages.seatsExceededPlanText, {
//       noOfSeatsInPlan: maximumSeatNumber,
//       noOfAdditionalSeats: additionalSeats,
//     });
//   }

//   return (
//     <Box
//       display="flex"
//       flexDirection="column"
//       padding="20px"
//       bgColor={rgba(colors.teal400, 0.07)}
//     >
//       <Box display="flex" alignItems="center">
//         {seatType === 'admin' && (
//           <Icon name="shield-checkered" fill={colors.teal300} mr="8px" />
//         )}
//         <Text color="teal700" variant="bodyM" fontWeight="bold" mr="4px">
//           {formatMessage(seatTypeTitleMessage)}
//         </Text>
//         <IconTooltip
//           content={
//             <FormattedMessage
//               {...seatTypeTooltipMessage}
//               values={{
//                 visitHelpCenter: (
//                   <a
//                     href={formatMessage(messages.rolesSupportPage2)}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <FormattedMessage {...messages.visitHelpCenter} />
//                   </a>
//                 ),
//               }}
//             />
//           }
//         />
//       </Box>

//       <Box display="flex">
//         <Box display="flex" flexDirection="column">
//           <Text color="teal700" mr="8px" variant="bodyS" my="0px">
//             {formatMessage(messages.remainingSeats)}
//           </Text>
//           <Text
//             fontSize="xl"
//             mt="4px"
//             data-cy={`e2e-${seatType}-remaining-seats`}
//           >
//             {remainingSeats}
//           </Text>
//         </Box>
//         <Box mx="24px">
//           <Text color="teal700" mr="8px" variant="bodyS" my="0px">
//             {formatMessage(messages.usedSeats)}
//           </Text>
//           <Text fontSize="xl" my="4px" data-cy={`e2e-${seatType}-used-seats`}>
//             {usedSeats}
//           </Text>
//           {!isOnSeatsOverviewPage && usedSeats > 0 && (
//             <StyledLink target="_blank" to={SEATS_OVERVIEW_PAGE}>
//               <Text variant="bodyXs" my="0px" color="coolGrey600">
//                 {formatMessage(messages.view)}
//               </Text>
//             </StyledLink>
//           )}
//         </Box>
//         <Box>
//           <Box display="flex">
//             <Text color="teal700" mr="8px" variant="bodyS" my="0px">
//               {formatMessage(messages.totalSeats)}
//             </Text>
//             <IconTooltip
//               content={<FormattedMessage {...messages.totalSeatsTooltip} />}
//             />
//           </Box>
//           <Text my="4px" fontSize="xl" data-cy={`e2e-${seatType}-total-seats`}>
//             {totalSeats}
//           </Text>
//           <Text variant="bodyXs" my="0px" color="coolGrey600">
//             {totalSeatsBreakdownMessage}
//           </Text>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default SeatInfo;

import React from 'react';

import {
  Box,
  colors,
  Icon,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useSeats from 'api/seats/useSeats';

import useTotalSeats from 'hooks/useTotalSeats';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

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

const SEATS_OVERVIEW_PAGE: RouteType = '/admin/users/seats';

const StyledLink = styled(Link)`
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
        <Box display="flex" alignItems="center">
          {seatType === 'admin' && (
            <Icon
              name="shield-checkered"
              mr="4px"
              fill={colors.teal500}
              height="20px"
            />
          )}
          {formatMessage(TOTAL_SEAT_MESSAGES[seatType], { totalSeats })}
        </Box>
        <Box display="flex" alignItems="center">
          <Box mr="20px" display="flex" alignItems="center">
            <Icon
              name="check-circle"
              mr="4px"
              fill={colors.teal500}
              height="18px"
            />
            {formatMessage(messages.assignedSeats, { assignedSeats })}
          </Box>
          <Box display="flex" alignItems="center">
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
          <StyledLink target="_blank" to={SEATS_OVERVIEW_PAGE}>
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
