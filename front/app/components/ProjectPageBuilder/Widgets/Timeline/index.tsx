import React, { useState, useEffect } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

// Renders the project's phase timeline (tabs + selected-phase title, dates and
// description), reusing the public project-page Timeline component.
const TimelineWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const padding = useCraftComponentDefaultPadding();
  const { data: phases } = usePhases(projectId);
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    if (!selectedPhase && phases && phases.data.length > 0) {
      setSelectedPhase(
        getCurrentPhase(phases.data) ?? phases.data[phases.data.length - 1]
      );
    }
  }, [phases, selectedPhase]);

  if (!projectId || !phases || phases.data.length === 0) {
    return null;
  }

  return (
    <Box
      id="e2e-project-page-timeline"
      maxWidth="1000px"
      margin="0 auto"
      px={padding}
    >
      <Title variant="h2" color="tenantText" mb="20px">
        <FormattedMessage {...messages.phasesHeading} />
      </Title>
      <Timeline
        projectId={projectId}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
      />
    </Box>
  );
};

// Phases aren't edited inline; the settings panel points admins to the project
// editor, where phases are configured.
const TimelineSettings = () => {
  const projectId = useWidgetProjectId();

  return (
    <Box my="20px">
      <Text color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.timelineManagedNote}
          values={{
            projectEditorLink: projectId ? (
              <Link
                to="/admin/projects/$projectId/phases"
                params={{ projectId }}
                target="_blank"
              >
                <FormattedMessage {...messages.projectEditorLinkText} />
              </Link>
            ) : (
              <FormattedMessage {...messages.projectEditorLinkText} />
            ),
          }}
        />
      </Text>
    </Box>
  );
};

TimelineWidget.craft = {
  related: {
    settings: TimelineSettings,
  },
  custom: {
    title: messages.timelineWidgetTitle,
    noPointerEvents: true,
  },
};

export const timelineWidgetTitle = messages.timelineWidgetTitle;

export default TimelineWidget;
