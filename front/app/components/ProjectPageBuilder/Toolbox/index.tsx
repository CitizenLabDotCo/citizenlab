import React from 'react';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import DescriptionToolboxSections from 'components/DescriptionBuilder/DescriptionBuilderToolbox/DescriptionToolboxSections';
import EventsWidget from 'components/ProjectPageBuilder/Widgets/Events';
import widgetMessages from 'components/ProjectPageBuilder/Widgets/messages';
import PhasesWidget from 'components/ProjectPageBuilder/Widgets/Phases';

import { useIntl } from 'utils/cl-intl';

const ProjectPageBuilderToolbox = () => {
  const { formatMessage } = useIntl();

  return (
    <Container>
      <DescriptionToolboxSections />
      <Section>
        <DraggableElement
          id="e2e-draggable-phases"
          component={<PhasesWidget />}
          icon="timeline"
          label={formatMessage(widgetMessages.phasesWidgetTitle)}
        />
        <DraggableElement
          id="e2e-draggable-events"
          component={<EventsWidget />}
          icon="calendar"
          label={formatMessage(widgetMessages.eventsWidgetTitle)}
        />
      </Section>
    </Container>
  );
};

export default ProjectPageBuilderToolbox;
