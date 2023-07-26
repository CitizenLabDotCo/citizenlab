import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';

// typings
import { IEventData } from 'api/events/types';
interface Props {
  event: IEventData;
}

const EventDescription = ({ event }: Props) => {
  if (!isNilOrError(event)) {
    return (
      <ReadMoreWrapper
        fontSize="base"
        contentId="event-description"
        value={event.attributes?.description_multiloc}
      />
    );
  }
  return null;
};

export default EventDescription;
