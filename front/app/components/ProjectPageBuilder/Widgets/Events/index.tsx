import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import useEvents from 'api/events/useEvents';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';
import SectionBackground from '../SectionBackground';
import useIsPageBodyChild from '../useIsPageBodyChild';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyEvents from './EmptyEvents';
import EventsList from './EventsList';

const PUBLICATION_STATUSES = ['published', 'draft', 'archived'] as const;
// The widget shows every event of the project; no project realistically has
// more than this.
const PAGE_SIZE = 100;

const EventsWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const isPageBodyChild = useIsPageBodyChild();
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const eventsParams = {
    projectIds: projectId ? [projectId] : [],
    projectPublicationStatuses: [...PUBLICATION_STATUSES],
    pageSize: PAGE_SIZE,
  };
  const { data: upcomingEvents } = useEvents(
    { ...eventsParams, currentAndFutureOnly: true },
    { enabled: !!projectId }
  );
  const { data: pastEvents } = useEvents(
    { ...eventsParams, pastOnly: true },
    { enabled: !!projectId }
  );

  if (!projectId || !upcomingEvents || !pastEvents) {
    return null;
  }

  if (upcomingEvents.data.length === 0 && pastEvents.data.length === 0) {
    return inEditor ? <EmptyEvents /> : null;
  }

  return (
    <EditModeHeightCap>
      <SectionBackground fullBleed={!!slug && isPageBodyChild} py="40px">
        <Box
          id="e2e-project-page-events"
          mx="auto"
          maxWidth={`${maxPageWidth}px`}
          px={padding}
        >
          <Title variant="h2" color="tenantText" m="0" mb="24px">
            <FormattedMessage {...messages.eventsWidgetTitle} />
          </Title>
          <EventsList
            upcomingEvents={upcomingEvents.data}
            pastEvents={pastEvents.data}
          />
        </Box>
      </SectionBackground>
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
  custom: {
    title: messages.eventsWidgetTitle,
    noPointerEvents: true,
  },
};

export default EventsWidget;
