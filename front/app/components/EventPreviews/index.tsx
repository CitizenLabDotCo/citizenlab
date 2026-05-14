import React from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useEvents from 'api/events/useEvents';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import HorizontalScroll from 'components/HorizontalScroll';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import EventPreviewCard from './EventPreviewCard';
import messages from './messages';

type EventPreviewsProps = {
  projectId?: string;
};

const EventPreviews = ({ projectId }: EventPreviewsProps) => {
  const { formatMessage } = useIntl();
  const isTablet = useBreakpoint('tablet');

  // project related
  const { slug } = useParams({ from: '/$locale/projects/$slug' });
  const { data: project } = useProjectBySlug(slug);
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

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (events && events?.data?.length > 0) {
    return (
      <>
        <Title
          color="tenantText"
          mt="36px"
          mb="8px"
          variant="h5"
          fontWeight="semi-bold"
          id="e2e-event-previews"
        >
          {formatMessage(messages.eventPreviewTimelineTitle)}
        </Title>
        <HorizontalScroll>
          <ul
            style={{ display: 'flex', listStyleType: 'none', padding: '0px' }}
          >
            {events.data.map((event) => (
              <li
                key={event.id}
                style={{
                  minWidth: isTablet ? '300px' : '340px',
                }}
                tabIndex={0}
                onClick={() => {
                  clHistory.push(`/events/${event.id}`, { scrollToTop: true });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    clHistory.push(`/events/${event.id}`, {
                      scrollToTop: true,
                    });
                  }
                }}
              >
                <EventPreviewCard event={event} />
              </li>
            ))}
          </ul>
        </HorizontalScroll>
      </>
    );
  }
  return null;
};

export default EventPreviews;
