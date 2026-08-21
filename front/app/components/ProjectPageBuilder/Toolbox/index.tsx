import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import DescriptionToolboxSections from 'components/DescriptionBuilder/DescriptionBuilderToolbox/DescriptionToolboxSections';
import EventsWidget from 'components/ProjectPageBuilder/Widgets/Events';
import widgetMessages from 'components/ProjectPageBuilder/Widgets/messages';
import PhasesWidget from 'components/ProjectPageBuilder/Widgets/Phases';
import SpotlightSurveysWidget from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys';

import { useIntl } from 'utils/cl-intl';

const ProjectPageBuilderToolbox = () => {
  const { formatMessage } = useIntl();
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });

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
        {spotlightSurveysEnabled && (
          <DraggableElement
            id="e2e-draggable-spotlight-surveys"
            component={<SpotlightSurveysWidget />}
            icon="survey"
            label={formatMessage(widgetMessages.extraSurveysWidgetTitle)}
          />
        )}
      </Section>
    </Container>
  );
};

export default ProjectPageBuilderToolbox;
