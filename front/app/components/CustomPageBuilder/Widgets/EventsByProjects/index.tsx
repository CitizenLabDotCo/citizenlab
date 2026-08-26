import React from 'react';

import { useEditor } from '@craftjs/core';

import ContentContainer from 'components/ContentContainer';
import Placeholder from 'components/CustomPageBuilder/Widgets/Placeholder';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import SectionBackground from 'components/ProjectPageBuilder/Widgets/SectionBackground';
import useIsPageBodyChild from 'components/ProjectPageBuilder/Widgets/useIsPageBodyChild';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import Settings from './Settings';
import { EventsByProjectsProps, filtersFor } from './types';

const EventsByProjects = ({
  mode = 'all',
  ids = [],
  sectionBackground = 'white',
  titleMultiloc = {},
}: Partial<EventsByProjectsProps>) => {
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));
  // The builder route carries a page id, the front office a slug — so a coloured band only
  // bleeds to the viewport edge where the page is actually being rendered.
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const isPageBodyChild = useIsPageBodyChild('CustomPageBody');

  if (mode !== 'all' && ids.length === 0) {
    return inBuilder ? (
      <Placeholder>
        <FormattedMessage {...messages.nothingSelected} />
      </Placeholder>
    ) : null;
  }

  return (
    <SectionBackground
      colored={sectionBackground === 'colored'}
      fullBleed={!!slug && isPageBodyChild}
      py="40px"
    >
      {/* Same container the page section used, so the list keeps its page alignment. */}
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
