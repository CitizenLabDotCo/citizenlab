import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { IEventData } from 'api/events/types';

import EventAttendanceButton from 'components/EventAttendanceButton';

import EventSharingButtons from './EventSharingButtons';
import EventDateStylized from './MetadataInformation/EventDateStylized';
import FullEventTime from './MetadataInformation/EventTimeTextual';
import Location from './MetadataInformation/Location';
import OnlineLink from './MetadataInformation/OnlineLink';
import ParticipantsCount from './MetadataInformation/ParticipantsCount';

interface Props {
  event: IEventData;
}

const InformationSectionMobile = ({ event }: Props) => {
  const isPastEvent = moment().isAfter(moment(event.attributes.end_at));

  return (
    <Box width={`100%`}>
      <Box display="flex" flexDirection="column" mt="30px">
        <Box
          padding="20px"
          borderRadius="3px"
          background={colors.background}
          mb="12px"
        >
          <Box padding="8px" background={colors.white}>
            <Box
              display="flex"
              flexDirection="column"
              gap="16px"
              px="20px"
              py="12px"
            >
              <EventDateStylized event={event} />
              <>
                {!isPastEvent && (
                  <Box mt="12px">
                    <EventAttendanceButton event={event} />
                  </Box>
                )}
                <ParticipantsCount event={event} />
                <Box borderBottom={`solid 1px ${colors.divider}`} />
              </>

              {event.attributes.address_1 && (
                <Box pb="16px" borderBottom={`solid 1px ${colors.divider}`}>
                  <Location event={event} />
                </Box>
              )}
              {event.attributes.online_link && (
                <Box pb="16px" borderBottom={`solid 1px ${colors.divider}`}>
                  <OnlineLink link={event.attributes.online_link} />
                </Box>
              )}
              <FullEventTime event={event} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box mb="16px">
        <EventSharingButtons event={event} />
      </Box>
    </Box>
  );
};

export default InformationSectionMobile;
