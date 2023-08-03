import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// typing
import { IEventData } from 'api/events/types';
import EventDateStylized from './MetadataInformation/EventDateStylized';
import Location from './MetadataInformation/Location';
import FullEventTime from './MetadataInformation/EventTimeTextual';

interface Props {
  event: IEventData;
}

const InformationSectionMobile = ({ event }: Props) => {
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
              <Box borderBottom={`solid 1px ${colors.divider}`}>
                <Location location={event.attributes.location_multiloc} />
              </Box>
              <FullEventTime event={event} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InformationSectionMobile;
