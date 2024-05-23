import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useParams } from 'react-router-dom';

import useEvents from 'api/events/useEvents';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import HorizontalScroll from 'components/HorizontalScroll';

import { useIntl } from 'utils/cl-intl';

import EventPreviewCard from './EventPreviewCard';
import messages from './messages';

type EventPreviewsProps = {
  projectId?: string;
};

const EventPreviews = ({ projectId }: EventPreviewsProps) => {
  const { formatMessage } = useIntl();

  // project related
  const params = useParams<{ slug: string }>();
  const { data: project } = useProjectBySlug(params.slug);
  const projectIdToUse = projectId || project?.data.id;
  const { data: phases } = usePhases(projectIdToUse);
  const { data: events } = useEvents({
    projectIds: projectIdToUse ? [projectIdToUse] : undefined,
    currentAndFutureOnly: true,
    sort: '-start_at',
    ongoing_during: [
      moment(getCurrentPhase(phases?.data)?.attributes.start_at).toString() ||
        null,
      moment(getCurrentPhase(phases?.data)?.attributes.end_at)
        .add(1, 'day')
        .toString() || null,
    ],
  });

  if (events && events?.data?.length > 0) {
    return (
      <>
        <Title
          color="tenantText"
          mt="36px"
          mb="8px"
          variant="h5"
          style={{ fontWeight: 600 }}
          id="e2e-event-previews"
        >
          {formatMessage(messages.eventPreviewTimelineTitle)}
        </Title>
        <HorizontalScroll containerRole="listbox">
          {events.data.map((event) => (
            <EventPreviewCard key={event.id} event={event} />
          ))}
        </HorizontalScroll>
      </>
    );
  }
  return null;
};

export default EventPreviews;
