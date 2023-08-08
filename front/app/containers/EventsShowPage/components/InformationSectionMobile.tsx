import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import EventAttendanceButton from 'components/EventAttendanceButton';
import ParticipantsCount from './MetadataInformation/ParticipantsCount';

// styling
import { colors } from 'utils/styleUtils';

// typing
import { IEventData } from 'api/events/types';
import EventDateStylized from './MetadataInformation/EventDateStylized';
import Location from './MetadataInformation/Location';
import FullEventTime from './MetadataInformation/EventTimeTextual';

// utils
import moment from 'moment';

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
                {event.attributes.attendees_count > 0 && (
                  <ParticipantsCount count={event.attributes.attendees_count} />
                )}
                <Box borderBottom={`solid 1px ${colors.divider}`} />
              </>

              {event.attributes.location_description && (
                <>
                  <Location
                    location={event.attributes.location_description}
                    event={event}
                  />
                  <Box borderBottom={`solid 1px ${colors.divider}`} />
                </>
              )}
              <FullEventTime event={event} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InformationSectionMobile;
