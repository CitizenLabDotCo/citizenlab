import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';
import { rightColumnWidthDesktop } from '../styleConstants';

// typing
import { IEventData } from 'api/events/types';
import EventDateStylized from './MetadataInformation/EventDateStylized';
import Location from './MetadataInformation/Location';
import FullEventTime from './MetadataInformation/EventTimeTextual';
import EventSharingButtons from './EventSharingButtons';

interface Props {
  event: IEventData;
  className?: string;
}

const RightColumnDesktop = ({ event, className }: Props) => {
  return (
    <Box
      flex={`0 0 ${rightColumnWidthDesktop}px`}
      width={`${rightColumnWidthDesktop}px`}
      position="sticky"
      top="110px"
      alignSelf="flex-start"
      className={className}
      ml="90px"
    >
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
                <Location location={event.attributes.location_description} />
              </Box>
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

export default RightColumnDesktop;
