import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// api
import useEventFiles from 'api/event_files/useEventFiles';

// components
import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import { Box } from '@citizenlab/cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// typings
import { IEventData } from 'api/events/types';

interface Props {
  event: IEventData;
}

const EventDescription = ({ event }: Props) => {
  const { data: eventFiles } = useEventFiles(event.id);

  if (!isNilOrError(event)) {
    return (
      <>
        <Box id="e2e-event-description">
          <ReadMoreWrapper
            fontSize="base"
            contentId="event-description"
            value={event.attributes?.description_multiloc}
          />
        </Box>

        {eventFiles && eventFiles.data.length > 0 && (
          <Box mt="28px" mb="24px" maxWidth="452px">
            <FileAttachments files={eventFiles.data} />
          </Box>
        )}
      </>
    );
  }
  return null;
};

export default EventDescription;
