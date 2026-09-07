import React, { useEffect } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import useWidgetProjectId from 'components/admin/ContentBuilder/useWidgetProjectId';
import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useLocation, useParams } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';
import SectionBackground, {
  SectionBackgroundChoice,
} from '../SectionBackground';
import SectionBackgroundSetting from '../SectionBackgroundSetting';
import useIsPageBodyChild from '../useIsPageBodyChild';

export const EVENTS_WIDGET_ANCHOR_ID = 'e2e-project-page-events';

type Props = {
  sectionBackground?: SectionBackgroundChoice;
};

const EventsWidget: UserComponent<Props> = ({ sectionBackground }) => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { hash } = useLocation();
  const isPageBodyChild = useIsPageBodyChild();
  const padding = useCraftComponentDefaultPadding();

  useEffect(() => {
    if (hash === EVENTS_WIDGET_ANCHOR_ID) {
      scrollToElement({ id: EVENTS_WIDGET_ANCHOR_ID });
    }
  }, [hash]);

  return (
    <SharedEventsWidget
      source="currentProject"
      timeFilters={['upcoming', 'past']}
      limit="all"
      renderFrame={(contents) => (
        <EditModeHeightCap>
          <SectionBackground
            colored={(sectionBackground ?? 'white') === 'colored'}
            fullBleed={!!slug && isPageBodyChild}
            py="40px"
          >
            <Box
              id={EVENTS_WIDGET_ANCHOR_ID}
              mx="auto"
              maxWidth={`${maxPageWidth}px`}
              px={padding}
            >
              {contents}
            </Box>
          </SectionBackground>
        </EditModeHeightCap>
      )}
    />
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
