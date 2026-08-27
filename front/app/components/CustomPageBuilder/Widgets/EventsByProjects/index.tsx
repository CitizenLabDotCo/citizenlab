import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import useFeatureFlag from 'hooks/useFeatureFlag';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';
import { EventsByProjectsProps } from './types';
import { filtersFor } from './utils';

const EventsByProjects = ({
  mode = 'all',
  ids = [],
  titleMultiloc = {},
}: Partial<EventsByProjectsProps>) => {
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));
  const padding = useCraftComponentDefaultPadding();
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  // Filtering is the paid capability; an unfiltered list stays available, as on the homepage.
  if (mode !== 'all' && !advancedCustomPagesEnabled) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="calendar">
        <FormattedMessage {...messages.notAvailable} />
      </WidgetPlaceholder>
    ) : null;
  }

  if (mode !== 'all' && ids.length === 0) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="projects">
        <FormattedMessage {...messages.nothingSelected} />
      </WidgetPlaceholder>
    ) : null;
  }

  return (
    // The width every builder widget uses, so the page lines up on one edge. The vertical
    // padding is the band's own: stacked bands sit flush, so each provides its own gap.
    <Box maxWidth="1200px" margin="0 auto" px={padding} py="40px">
      <EventsWidget
        filters={filtersFor(mode, ids)}
        titleMultiloc={titleMultiloc}
      />
    </Box>
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
