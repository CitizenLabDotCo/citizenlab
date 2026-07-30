import React, { useState } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import useEvents from 'api/events/useEvents';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import sharedMessages from 'utils/messages';
import { useParams } from 'utils/router';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';
import SectionBackground, {
  SectionBackgroundChoice,
} from '../SectionBackground';
import SectionBackgroundSetting from '../SectionBackgroundSetting';
import useIsPageBodyChild from '../useIsPageBodyChild';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyEvents from './EmptyEvents';
import EventsSection from './EventsSection';

const PUBLICATION_STATUSES = ['published', 'draft', 'archived'] as const;
const PAGE_SIZE = 15;

type Props = {
  sectionBackground?: SectionBackgroundChoice;
};

const EventsWidget: UserComponent<Props> = ({ sectionBackground }) => {
  const colored = (sectionBackground ?? 'white') === 'colored';
  const projectId = useWidgetProjectId();
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const isPageBodyChild = useIsPageBodyChild();
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const eventsParams = {
    projectIds: projectId ? [projectId] : [],
    projectPublicationStatuses: [...PUBLICATION_STATUSES],
    pageSize: PAGE_SIZE,
  };
  const { data: upcomingEvents } = useEvents(
    { ...eventsParams, currentAndFutureOnly: true, pageNumber: upcomingPage },
    { enabled: !!projectId }
  );
  const { data: pastEvents } = useEvents(
    { ...eventsParams, pastOnly: true, pageNumber: pastPage },
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
      <SectionBackground
        colored={colored}
        fullBleed={!!slug && isPageBodyChild}
        py="40px"
      >
        <Box
          id="e2e-project-page-events"
          mx="auto"
          maxWidth={`${maxPageWidth}px`}
          px={padding}
        >
          <Title variant="h2" color="tenantText" m="0" mb="24px">
            <FormattedMessage {...messages.eventsWidgetTitle} />
          </Title>
          <Box display="flex" flexDirection="column" gap="48px">
            <EventsSection
              title={sharedMessages.upcomingAndOngoingEvents}
              events={upcomingEvents}
              currentPage={upcomingPage}
              onPageChange={setUpcomingPage}
            />
            <EventsSection
              title={sharedMessages.pastEvents}
              events={pastEvents}
              currentPage={pastPage}
              onPageChange={setPastPage}
            />
          </Box>
        </Box>
      </SectionBackground>
    </EditModeHeightCap>
  );
};

const EventsSettings = () => {
  const projectId = useWidgetProjectId();

  return (
    <Box my="20px">
      <SectionBackgroundSetting defaultValue="white" />
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
