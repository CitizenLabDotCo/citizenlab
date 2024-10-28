import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useEventFiles from 'api/event_files/useEventFiles';
import { IEventData } from 'api/events/types';

import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import FileAttachments from 'components/UI/FileAttachments';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  event: IEventData;
}

const EventDescription = ({ event }: Props) => {
  const { data: eventFiles } = useEventFiles(event.id);

  if (!isNilOrError(event)) {
    return (
      <>
        <Box data-cy="e2e-event-description">
          <ReadMoreWrapper
            fontSize="base"
            contentId="event-description"
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
