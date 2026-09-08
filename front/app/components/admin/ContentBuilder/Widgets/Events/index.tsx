import React, { useEffect, useState } from 'react';

import {
  Box,
  Title,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';
import styled from 'styled-components';

import { InputParameters } from 'api/events/types';
import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import eventsPageMessages from 'containers/EventsPage/messages';

import useWidgetProjectId from 'components/admin/ContentBuilder/useWidgetProjectId';
import landingPageMessages from 'components/LandingPages/citizen/messages';
import EmptyEvents from 'components/ProjectPageBuilder/Widgets/Events/EmptyEvents';
import EventsSection from 'components/ProjectPageBuilder/Widgets/Events/EventsSection';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';
import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import defaultHeadingMessage from './defaultHeading';
import messages from './messages';
import EventsSettings from './Settings';
import { EventsProps, EventsSource } from './types';

export const EVENTS_WIDGET_NAME = 'EventsList';
// The project page's events CTAs scroll to this. It lives here so a node stored under
// either name offers the target.
export const EVENTS_WIDGET_ANCHOR_ID = 'e2e-project-page-events';

const PAGINATED_PAGE_SIZE = 15;
const CURRENT_PROJECT_STATUSES = ['published', 'draft', 'archived'] as const;

const NoEventsText = styled.div`
  margin: auto 0px;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xl}px;
`;

const ViewAllEventsLink = typedStyled(Link)`
  color: ${colors.textSecondary};
`;

const selectionParams = (
  source: EventsSource,
  ids: string[],
  currentProjectId?: string
): InputParameters => {
  switch (source) {
    case 'currentProject':
      return { projectIds: currentProjectId ? [currentProjectId] : [] };
    case 'projects':
      return { projectIds: ids };
    case 'areas':
      return { areas: ids };
    case 'global_topics':
      return { globalTopics: ids };
    case 'spaces':
      return { spaces: ids };
    case 'all':
      return {};
  }
};

const EventsWidget: UserComponent<EventsProps> = ({
  source = 'all',
  ids = [],
  titleMultiloc,
  timeFilters = ['upcoming'],
  limit = 3,
  projectPublicationStatuses = ['published'],
  showEmptyMessage = false,
  renderFrame,
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const currentProjectId = useWidgetProjectId();
  const { hash } = useLocation();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const isProjectEvents = source === 'currentProject';

  useEffect(() => {
    if (isProjectEvents && hash === EVENTS_WIDGET_ANCHOR_ID) {
      scrollToElement({ id: EVENTS_WIDGET_ANCHOR_ID });
    }
  }, [hash, isProjectEvents]);

  const showUpcoming = timeFilters.includes('upcoming');
  const showPast = timeFilters.includes('past');
  const paginated = limit === 'all';

  const params: InputParameters = {
    ...selectionParams(source, ids, currentProjectId),
    // Filtering the one project by its own status would hide an archived project's events
    // from its own page.
    projectPublicationStatuses: isProjectEvents
      ? [...CURRENT_PROJECT_STATUSES]
      : projectPublicationStatuses,
    pageSize: paginated ? PAGINATED_PAGE_SIZE : limit,
    // `-start_at` is ascending: SortByParamsService inverts the usual convention.
    sort: '-start_at',
  };
  const waitingForProject = isProjectEvents && !currentProjectId;

  const { data: upcomingEvents } = useEvents(
    { ...params, currentAndFutureOnly: true, pageNumber: upcomingPage },
    { enabled: showUpcoming && !waitingForProject }
  );
  const { data: pastEvents } = useEvents(
    { ...params, pastOnly: true, pageNumber: pastPage },
    { enabled: showPast && !waitingForProject }
  );

  if (waitingForProject) return null;
  if (showUpcoming && !upcomingEvents) return null;
  if (showPast && !pastEvents) return null;

  const isEmpty =
    (upcomingEvents?.data.length ?? 0) === 0 &&
    (pastEvents?.data.length ?? 0) === 0;

  // EmptyEvents brings its own frame, and the caller's frame should not paint an empty band.
  if (isEmpty && !showEmptyMessage) {
    return inEditor ? <EmptyEvents /> : null;
  }

  const contents = (
    <Box
      id={isProjectEvents ? EVENTS_WIDGET_ANCHOR_ID : undefined}
      display="flex"
      flexDirection="column"
      data-cy="e2e-events-widget"
    >
      <Title variant="h2" color="tenantText" m="0" mb="24px">
        {titleMultiloc
          ? localize(titleMultiloc)
          : formatMessage(defaultHeadingMessage(source))}
      </Title>

      {isEmpty ? (
        <Box display="flex" alignItems="center" mb="32px">
          <NoEventsText>
            {formatMessage(eventsPageMessages.noUpcomingOrOngoingEvents)}
          </NoEventsText>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap="48px">
          {upcomingEvents && (
            <EventsSection
              id="e2e-project-page-upcoming-events"
              title={sharedMessages.upcomingAndOngoingEvents}
              showTitle={showUpcoming && showPast}
              events={upcomingEvents}
              currentPage={upcomingPage}
              onPageChange={setUpcomingPage}
              showPagination={paginated}
            />
          )}
          {pastEvents && (
            <EventsSection
              id="e2e-project-page-past-events"
              title={sharedMessages.pastEvents}
              showTitle={showUpcoming && showPast}
              events={pastEvents}
              currentPage={pastPage}
              onPageChange={setPastPage}
              showPagination={paginated}
            />
          )}
        </Box>
      )}

      {!paginated && (
        <Box alignSelf="center" mt="24px">
          <ViewAllEventsLink to="/events">
            {formatMessage(landingPageMessages.viewAllEventsText)}
          </ViewAllEventsLink>
        </Box>
      )}
    </Box>
  );

  return <>{renderFrame ? renderFrame(contents) : contents}</>;
};

EventsWidget.craft = {
  related: {
    settings: EventsSettings,
  },
  custom: {
    title: messages.eventsListTitle,
    noPointerEvents: true,
  },
};

export default EventsWidget;
