import React from 'react';

import { useEditor } from '@craftjs/core';

import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import ContentContainer from 'components/ContentContainer';
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
      {/* The container the page section used, so the list keeps its page alignment. */}
      <ContentContainer mode="page">
        <EventsWidget
          filters={filtersFor(mode, ids)}
          titleMultiloc={titleMultiloc}
        />
      </ContentContainer>
    </SectionBackground>
  );
};

EventsByProjects.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.events,
  },
};

export default EventsByProjects;
