import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Node, UserComponent, useEditor } from '@craftjs/core';

import useEvents from 'api/events/useEvents';

import EventsViewer from 'containers/EventsPage/EventsViewer';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyEvents from './EmptyEvents';

const PUBLICATION_STATUSES = ['published', 'draft', 'archived'] as const;

const EventsWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { data: events } = useEvents(
    {
      projectIds: projectId ? [projectId] : [],
      sort: '-start_at',
    },
    { enabled: !!projectId }
  );

  if (!projectId || !events) {
    return null;
  }

  if (events.data.length === 0) {
    return inEditor ? <EmptyEvents /> : null;
  }

  return (
    <EditModeHeightCap>
      <Box
        id="e2e-project-page-events"
        display="flex"
        flexDirection="column"
        gap="48px"
        mx="auto"
        my="48px"
        maxWidth={`${maxPageWidth}px`}
        px={padding}
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
    canDrop: (dropTarget: Node) => dropTarget.data.name === 'ProjectPageBody',
  },
  custom: {
    title: messages.eventsWidgetTitle,
    noPointerEvents: true,
  },
};

export default EventsWidget;
