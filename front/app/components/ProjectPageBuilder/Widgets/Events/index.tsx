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

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyEvents from './EmptyEvents';

const PUBLICATION_STATUSES = ['published', 'draft', 'archived'] as const;

const EventsWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { data: events } = useEvents({
    projectIds: projectId ? [projectId] : [],
    sort: '-start_at',
  });

  if (!projectId || isNil(events)) {
    return null;
  }

  if (events.data.length === 0) {
    return slug ? null : <EmptyEvents />;
  }

  return (
    <EditModeHeightCap>
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
    </EditModeHeightCap>
  );
};

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

export default EventsWidget;
