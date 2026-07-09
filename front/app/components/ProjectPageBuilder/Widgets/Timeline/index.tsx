import React, { useMemo } from 'react';

import { Box, Title, isRtl } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import PhaseNavigation from 'containers/ProjectsShowPage/timeline/PhaseNavigation';
import setPhaseURL from 'containers/ProjectsShowPage/timeline/setPhaseURL';
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';
import { useParams } from 'utils/router';

import messages from '../messages';
import SectionBackground from '../SectionBackground';
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

// The phase timeline, reusing the public project-page components; the selected
// phase follows the URL phase param, mirroring ProjectTimelineContainer.
// Rendered as the top half of the Phases widget; not a standalone widget.
const TimelineSection = () => {
  const projectId = useWidgetProjectId();
  const { slug, phaseNumber } = useParams({ strict: false }) as {
    slug?: string;
    phaseNumber?: string;
  };
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const currentLocale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const canModerate = usePermission({
    item: project?.data ?? null,
    action: 'moderate',
  });

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

  // Same visibility rule as the legacy page: a single open-ended phase without
  // a description shows no timeline — for anyone. The builder keeps a placeholder.
  if (hideTimelineUI(phases.data, currentLocale)) {
    return inEditor ? (
      <EmptyTimeline
        titleMessage={messages.timelineHiddenTitle}
        noteMessage={messages.timelineHiddenNote}
      />
    ) : null;
  }

  // Tabs navigate via links; this only drives keyboard-arrow selection.
  const selectPhase = (phase: IPhaseData) => {
    if (!slug || !project) return;
    setPhaseURL(phase, phases.data, project.data);
  };

  return (
    <SectionBackground fullBleed={!!slug} py="40px">
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

export default TimelineSection;
