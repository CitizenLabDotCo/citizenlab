import React, { useContext, useEffect, useState } from 'react';

import {
  Box,
  Title,
  colors,
  fontSizes,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';
import styled from 'styled-components';

import { InputParameters } from 'api/events/types';
import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_Y_PADDING } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/constants';
import eventsPageMessages from 'containers/EventsPage/messages';

import {
  BUILDER_CONTENT_MAX_WIDTH,
  DEFAULT_PADDING,
} from 'components/admin/ContentBuilder/constants';
import EventCardsSkeleton from 'components/EventCards/Skeleton';
import EditModeHeightCap from 'components/ProjectPageBuilder/Widgets/EditModeHeightCap';
import EmptyEvents from 'components/ProjectPageBuilder/Widgets/Events/EmptyEvents';
import EventsSection from 'components/ProjectPageBuilder/Widgets/Events/EventsSection';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';
import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import useWidgetProjectId from '../../useWidgetProjectId';
import { VerticalRhythmContext } from '../../verticalRhythm';

import messages from './messages';
import EventsSettings, { defaultHeadingMessage } from './Settings';
import { EventsProps, EventsSource } from './types';

export const EVENTS_WIDGET_NAME = 'EventsList';
// The project page's events CTAs scroll to this. It lives here so a node stored under
// either name offers the target.
export const EVENTS_WIDGET_ANCHOR_ID = 'e2e-project-page-events';

const PAGINATED_PAGE_SIZE = 15;
const BAND_Y_PADDING = '40px';
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

const EventsList: UserComponent<EventsProps> = ({
  source = 'all',
  ids = [],
  titleMultiloc,
  timeFilters = ['upcoming'],
  limit = 3,
  projectPublicationStatuses = ['published'],
  showEmptyMessage = false,
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const currentProjectId = useWidgetProjectId();
  const padding = useCraftComponentDefaultPadding();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const underRhythm = useContext(VerticalRhythmContext);
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
  };
  const waitingForProject = isProjectEvents && !currentProjectId;

  const { data: upcomingEvents, isLoading: loadingUpcoming } = useEvents(
    // `-start_at` is ascending: SortByParamsService inverts the usual convention.
    { ...params, sort: '-start_at', currentAndFutureOnly: true, pageNumber: upcomingPage },
    { enabled: showUpcoming && !waitingForProject }
  );
  const { data: pastEvents, isLoading: loadingPast } = useEvents(
    // `start_at` is descending
    { ...params, sort: 'start_at', pastOnly: true, pageNumber: pastPage },
    { enabled: showPast && !waitingForProject }
  );

  const loading = waitingForProject || loadingUpcoming || loadingPast;
  // Not loading and still no data: the request failed.
  if (!loading && showUpcoming && !upcomingEvents) return null;
  if (!loading && showPast && !pastEvents) return null;

  // A disabled query keeps serving its last result, so a bucket is read through its own filter
  // rather than through the query: switching one off has to stop it rendering.
  const upcoming = showUpcoming ? upcomingEvents : undefined;
  const past = showPast ? pastEvents : undefined;

  const isEmpty =
    (upcoming?.data.length ?? 0) === 0 && (past?.data.length ?? 0) === 0;

  // EmptyEvents brings its own frame, and the caller's frame should not paint an empty band.
  if (!loading && isEmpty && !showEmptyMessage) {
    return inEditor ? <EmptyEvents /> : null;
  }

  const heading = (
    <Title variant="h2" color="tenantText" m="0" mb="24px">
      {titleMultiloc
        ? localize(titleMultiloc)
        : formatMessage(defaultHeadingMessage(timeFilters))}
    </Title>
  );

  const contents = loading ? (
    <Box display="flex" flexDirection="column">
      {heading}
      <EventCardsSkeleton count={paginated ? 3 : Math.min(limit, 3)} />
    </Box>
  ) : (
    <Box
      id={isProjectEvents ? EVENTS_WIDGET_ANCHOR_ID : undefined}
      display="flex"
      flexDirection="column"
      data-cy="e2e-events-widget"
    >
      {heading}

      {isEmpty ? (
        <Box display="flex" alignItems="center" mb="32px">
          <NoEventsText>
            {formatMessage(eventsPageMessages.noUpcomingOrOngoingEvents)}
          </NoEventsText>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap="48px">
          {upcoming && (
            <EventsSection
              id="e2e-project-page-upcoming-events"
              title={sharedMessages.upcomingAndOngoingEvents}
              showTitle={showUpcoming && showPast}
              events={upcoming}
              currentPage={upcomingPage}
              onPageChange={setUpcomingPage}
              showPagination={paginated}
            />
          )}
          {past && (
            <EventsSection
              id="e2e-project-page-past-events"
              title={sharedMessages.pastEvents}
              showTitle={showUpcoming && showPast}
              events={past}
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
            {formatMessage(sharedMessages.viewAllEvents)}
          </ViewAllEventsLink>
        </Box>
      )}
    </Box>
  );

  // A band pads itself, which is why the rhythm system leaves no margin between two of them.
  // The homepage is outside that system and spaces its widgets on a smaller scale of its own.
  const homepagePadding = isSmallerThanTablet
    ? DEFAULT_PADDING
    : DEFAULT_Y_PADDING;
  const bandPadding = underRhythm ? BAND_Y_PADDING : homepagePadding;

  const band = (
    <Box
      maxWidth={BUILDER_CONTENT_MAX_WIDTH}
      margin="0 auto"
      px={padding}
      py={bandPadding}
    >
      {contents}
    </Box>
  );

  // A project page lists every event it has, which is the one case where the list can swallow
  // the builder canvas.
  return isProjectEvents ? <EditModeHeightCap>{band}</EditModeHeightCap> : band;
};

EventsList.craft = {
  related: {
    settings: EventsSettings,
  },
  custom: {
    title: messages.eventsListTitle,
    noPointerEvents: true,
  },
};

export const eventsListTitle = messages.eventsListTitle;

export default EventsList;
