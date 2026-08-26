import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import SectionBackground from 'components/ProjectPageBuilder/Widgets/SectionBackground';
import useIsPageBodyChild from 'components/ProjectPageBuilder/Widgets/useIsPageBodyChild';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import Settings from './Settings';
import { EventsByProjectsProps } from './types';
import { filtersFor } from './utils';

const EventsByProjects = ({
  mode = 'all',
  ids = [],
  sectionBackground = 'white',
  titleMultiloc = {},
}: Partial<EventsByProjectsProps>) => {
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));
  // Only the front-office route carries a slug, so a coloured band bleeds to the viewport
  // edge there but not in the builder canvas.
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const isPageBodyChild = useIsPageBodyChild('CustomPageBody');
  const padding = useCraftComponentDefaultPadding();

  if (mode !== 'all' && ids.length === 0) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="projects">
        <FormattedMessage {...messages.nothingSelected} />
      </WidgetPlaceholder>
    ) : null;
  }

  return (
    <SectionBackground
      colored={sectionBackground === 'colored'}
      fullBleed={!!slug && isPageBodyChild}
      py="40px"
    >
      {/* The width every builder widget uses, so the page lines up on one edge. */}
      <Box maxWidth="1200px" margin="0 auto" px={padding}>
        <EventsWidget
          filters={filtersFor(mode, ids)}
          titleMultiloc={titleMultiloc}
        />
      </Box>
    </SectionBackground>
  );
};

EventsByProjects.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.events,
    noPointerEvents: true,
  },
};

export default EventsByProjects;
