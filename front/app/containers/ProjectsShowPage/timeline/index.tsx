import React, { useMemo } from 'react';

import { Box, colors, isRtl, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import messages from 'containers/ProjectsShowPage/messages';

import SectionContainer from 'components/SectionContainer';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import { isValidPhase } from '../phaseParam';

import PhaseNavigation from './PhaseNavigation';
import PhaseParticipationContent from './PhaseParticipationContent';
import setPhaseURL from './setPhaseURL';
import Timeline from './Timeline';

const StyledSectionContainer = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = ({ projectId, className }: Props) => {
  const { phaseNumber } = useParams({ strict: false }) as {
    phaseNumber?: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentLocale = useLocale();

  const selectedPhase = useMemo(() => {
    if (!phases) return;

    // if a phase parameter was provided, and it is valid, we set that as phase.
    // otherwise, use the most logical phase
    if (isValidPhase(phaseNumber, phases.data)) {
      const phaseIndex = Number(phaseNumber) - 1;
      return phases.data[phaseIndex];
    }

    return getLatestRelevantPhase(phases.data);
  }, [phaseNumber, phases]);

  if (!project) return null;

  const selectPhase = (phase: IPhaseData) => {
    if (!phases) return;
    setPhaseURL(phase, phases.data, project.data);
  };

  if (selectedPhase) {
    return (
      <StyledSectionContainer
        className={`${className || ''} e2e-project-process-page`}
      >
        <PhaseParticipationContent project={project.data} phase={selectedPhase}>
          {!hideTimelineUI(phases?.data, currentLocale) && (
            <>
              <Header>
                <Title variant="h2" m="0" color="tenantText">
                  <FormattedMessage {...messages.phases} />
                </Title>
                <PhaseNavigation projectId={projectId} buttonStyle="white" />
              </Header>
              <Box mb="22px">
                <Timeline
                  projectId={projectId}
                  selectedPhase={selectedPhase}
                  setSelectedPhase={selectPhase}
                />
              </Box>
            </>
          )}
        </PhaseParticipationContent>
      </StyledSectionContainer>
    );
  }

  return null;
};

export default ProjectTimelineContainer;
