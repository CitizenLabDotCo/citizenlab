import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';
import { isNil } from 'lodash-es';

import useEvents from 'api/events/useEvents';

import EventsViewer from 'containers/EventsPage/EventsViewer';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';
import { useParams } from 'utils/router';

import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyEvents from './EmptyEvents';

const PUBLICATION_STATUSES = ['published', 'draft', 'archived'] as const;

// Renders the project's "Upcoming and ongoing" + "Past" events sections, reusing
// the same EventsViewer the public project page uses.
const EventsWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const isSmallerThanTablet = useBreakpoint('tablet');
  // The public project page route carries a slug; the builder routes don't.
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { data: events } = useEvents({
    projectIds: projectId ? [projectId] : [],
    sort: '-start_at',
  });

  if (!projectId || isNil(events)) {
    return null;
  }

  // With no events, the public page shows nothing — for everyone, admins
  // included, so the live page is exactly what citizens see (matching the
  // legacy page). The builder keeps an empty state so admins know where
  // events will render.
  if (events.data.length === 0) {
    return slug ? null : <EmptyEvents />;
  }

  return (
    <Box
      id="e2e-project-page-events"
      display="flex"
      flexDirection="column"
      gap="48px"
      mx="auto"
      mt="48px"
      maxWidth={`${maxPageWidth}px`}
      px={isSmallerThanTablet ? '20px' : padding}
    >
      <EventsViewer
        showProjectFilter={false}
        projectId={projectId}
        eventsTime="currentAndFuture"
        title={formatMessage(sharedMessages.upcomingAndOngoingEvents)}
        fallbackMessage={sharedMessages.noUpcomingOrOngoingEvents}
        projectPublicationStatuses={[...PUBLICATION_STATUSES]}
      />
      <EventsViewer
        showProjectFilter={false}
        projectId={projectId}
        eventsTime="past"
        title={formatMessage(sharedMessages.pastEvents)}
        fallbackMessage={sharedMessages.noPastEvents}
        projectPublicationStatuses={[...PUBLICATION_STATUSES]}
        showDateFilter={false}
      />
    </Box>
  );
};

// Events aren't edited inline; the settings panel points admins to the project's
// Events editor, where events are added/edited/removed.
const EventsSettings = () => {
  const projectId = useWidgetProjectId();

  return (
    <Box my="20px">
      <Text color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.eventsManagedNote}
          values={{
            eventsLink: projectId ? (
              <Link
                to="/admin/projects/$projectId/events"
                params={{ projectId }}
                target="_blank"
              >
                <FormattedMessage {...messages.eventsLinkText} />
              </Link>
            ) : (
              <FormattedMessage {...messages.eventsLinkText} />
            ),
          }}
        />
      </Text>
    </Box>
  );
};

EventsWidget.craft = {
  related: {
    settings: EventsSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.eventsWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

export const eventsWidgetTitle = messages.eventsWidgetTitle;

export default EventsWidget;
