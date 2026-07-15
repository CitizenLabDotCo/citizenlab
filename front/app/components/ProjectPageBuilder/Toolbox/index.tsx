import React from 'react';

import useParallelParticipation from 'hooks/useParallelParticipation';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import DescriptionToolboxSections from 'components/DescriptionBuilder/DescriptionBuilderToolbox/DescriptionToolboxSections';
import EventsWidget from 'components/ProjectPageBuilder/Widgets/Events';
import ExtraSurveysWidget from 'components/ProjectPageBuilder/Widgets/ExtraSurveys';
import widgetMessages from 'components/ProjectPageBuilder/Widgets/messages';
import PhasesWidget from 'components/ProjectPageBuilder/Widgets/Phases';

import { useIntl } from 'utils/cl-intl';

const ProjectPageBuilderToolbox = () => {
  const { formatMessage } = useIntl();
  const parallelParticipation = useParallelParticipation();

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
        {parallelParticipation && (
          <DraggableElement
            id="e2e-draggable-extra-surveys"
            component={<ExtraSurveysWidget />}
            icon="survey"
            label={formatMessage(widgetMessages.extraSurveysWidgetTitle)}
          />
        )}
      </Section>
    </Container>
  );
};

export default ProjectPageBuilderToolbox;
