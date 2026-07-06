import React, { useMemo } from 'react';

import { Box, Text, Title, isRtl } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import PhaseNavigation from 'containers/ProjectsShowPage/timeline/PhaseNavigation';
import setPhaseURL from 'containers/ProjectsShowPage/timeline/setPhaseURL';
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from '../messages';
import SectionBackground from '../SectionBackground';
import useCanModerateProject from '../useCanModerateProject';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyTimeline from './EmptyTimeline';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

// Renders the project's phase timeline (heading + phase navigation arrows + the
// tabs/selected-phase details), reusing the public project-page components. The
// selected phase follows the URL phase param, so clicking a phase tab (which
// navigates) updates the highlight and details — mirroring ProjectTimelineContainer.
const TimelineWidget: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const { slug, phaseNumber } = useParams({ strict: false }) as {
    slug?: string;
    phaseNumber?: string;
  };
  const padding = useCraftComponentDefaultPadding();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const canModerate = useCanModerateProject(projectId);

  const selectedPhase = useMemo(() => {
    if (!phases) return undefined;
    if (isValidPhase(phaseNumber, phases.data)) {
      return phases.data[Number(phaseNumber) - 1];
    }
    return getLatestRelevantPhase(phases.data);
  }, [phaseNumber, phases]);

  if (!projectId || !phases) {
    return null;
  }

  if (phases.data.length === 0) {
    return canModerate ? <EmptyTimeline /> : null;
  }

  // Phase tabs navigate via links; this only drives keyboard-arrow selection,
  // and only on the public route (in the builder the widget is non-interactive).
  const selectPhase = (phase: IPhaseData) => {
    if (!slug || !project) return;
    setPhaseURL(phase, phases.data, project.data);
  };

  return (
    <SectionBackground $fullBleed={!!slug} py="40px">
      <Box
        id="e2e-project-page-timeline"
        maxWidth={`${maxPageWidth}px`}
        margin="0 auto"
        px={padding}
      >
        <Header>
          <Title variant="h2" color="tenantText" m="0">
            <FormattedMessage {...messages.phasesHeading} />
          </Title>
          <PhaseNavigation projectId={projectId} buttonStyle="white" />
        </Header>
        <Timeline
          projectId={projectId}
          selectedPhase={selectedPhase}
          setSelectedPhase={selectPhase}
        />
      </Box>
    </SectionBackground>
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
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.timelineWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

export const timelineWidgetTitle = messages.timelineWidgetTitle;

export default TimelineWidget;
