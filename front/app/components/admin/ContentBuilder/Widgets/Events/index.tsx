import React, { useEffect, useState } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';
import { Multiloc } from 'typings';

import { InputParameters } from 'api/events/types';
import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import useWidgetProjectId from 'components/admin/ContentBuilder/useWidgetProjectId';
import landingPageMessages from 'components/LandingPages/citizen/messages';
import EditModeHeightCap from 'components/ProjectPageBuilder/Widgets/EditModeHeightCap';
import EmptyEvents from 'components/ProjectPageBuilder/Widgets/Events/EmptyEvents';
import EventsSection from 'components/ProjectPageBuilder/Widgets/Events/EventsSection';
import projectPageMessages from 'components/ProjectPageBuilder/Widgets/messages';
import SectionBackground, {
  SectionBackgroundChoice,
} from 'components/ProjectPageBuilder/Widgets/SectionBackground';
import useIsPageBodyChild from 'components/ProjectPageBuilder/Widgets/useIsPageBodyChild';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';
import { useLocation, useParams } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

export const EVENTS_ANCHOR_ID = 'e2e-project-page-events';

const PAGINATED_PAGE_SIZE = 15;
const CURRENT_PROJECT_STATUSES = ['published', 'draft', 'archived'] as const;

export type EventsSource =
  | 'all'
  | 'currentProject'
  | 'projects'
  | 'global_topics'
  | 'areas'
  | 'spaces';
export type EventsTimeFilter = 'upcoming' | 'past';
export type EventsLimit = number | 'all';
export type EventsPublicationStatus = 'published' | 'archived';

export type EventsProps = {
  source?: EventsSource;
  ids?: string[];
  titleMultiloc?: Multiloc;
  timeFilters?: EventsTimeFilter[];
  limit?: EventsLimit;
  projectPublicationStatuses?: EventsPublicationStatus[];
  sectionBackground?: SectionBackgroundChoice;
};

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
  sectionBackground,
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const currentProjectId = useWidgetProjectId();
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { hash } = useLocation();
  const isPageBodyChild = useIsPageBodyChild();
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const showUpcoming = timeFilters.includes('upcoming');
  const showPast = timeFilters.includes('past');
  const paginated = limit === 'all';

  const params: InputParameters = {
    ...selectionParams(source, ids, currentProjectId),
    // Filtering the one project by its own status would hide an archived project's own
    // events from its page.
    projectPublicationStatuses:
      source === 'currentProject'
        ? [...CURRENT_PROJECT_STATUSES]
        : projectPublicationStatuses,
    pageSize: paginated ? PAGINATED_PAGE_SIZE : limit,
    // `-start_at` is ascending: SortByParamsService inverts the usual convention.
    sort: '-start_at',
  };
  const waitingForProject = source === 'currentProject' && !currentProjectId;

  const { data: upcomingEvents } = useEvents(
    { ...params, currentAndFutureOnly: true, pageNumber: upcomingPage },
    { enabled: showUpcoming && !waitingForProject }
  );
  const { data: pastEvents } = useEvents(
    { ...params, pastOnly: true, pageNumber: pastPage },
    { enabled: showPast && !waitingForProject }
  );

  const upcomingCount = upcomingEvents?.data.length ?? 0;
  const pastCount = pastEvents?.data.length ?? 0;
  const anchorRendered = upcomingCount > 0 || pastCount > 0;

  useEffect(() => {
    if (hash === EVENTS_ANCHOR_ID && anchorRendered) {
      scrollToElement({ id: EVENTS_ANCHOR_ID });
    }
  }, [hash, anchorRendered]);

  if (waitingForProject) return null;
  if (showUpcoming && !upcomingEvents) return null;
  if (showPast && !pastEvents) return null;

  if (!anchorRendered) {
    return inEditor ? <EmptyEvents /> : null;
  }

  const heading = titleMultiloc
    ? localize(titleMultiloc)
    : formatMessage(
        source === 'currentProject'
          ? projectPageMessages.eventsWidgetTitle
          : landingPageMessages.upcomingEventsWidgetTitle
      );

  return (
    <EditModeHeightCap>
      <SectionBackground
        colored={(sectionBackground ?? 'white') === 'colored'}
        fullBleed={!!slug && isPageBodyChild}
        py="40px"
      >
        <Box
          id={EVENTS_ANCHOR_ID}
          mx="auto"
          maxWidth={`${maxPageWidth}px`}
          px={padding}
        >
          <Title variant="h2" color="tenantText" m="0" mb="24px">
            {heading}
          </Title>
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
          {!paginated && (
            <Box alignSelf="center" display="flex" justifyContent="center">
              <ViewAllEventsLink to="/events">
                {formatMessage(landingPageMessages.viewAllEventsText)}
              </ViewAllEventsLink>
            </Box>
          )}
        </Box>
      </SectionBackground>
    </EditModeHeightCap>
  );
};

const ViewAllEventsLink = typedStyled(Link)`
  margin-top: 24px;
`;

export default EventsWidget;
