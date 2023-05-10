import React from 'react';
import usePhases from 'api/phases/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import PhaseDescription from './PhaseDescription';

interface Props {
  projectId: string;
  selectedPhaseId: string;
}

const StyledPhaseDescription = styled(PhaseDescription)<{
  hasBottomMargin: boolean;
}>`
  margin-bottom: ${(props) => (props.hasBottomMargin ? '50px' : '0px')};
`;

const PhaseDescriptions = ({ projectId, selectedPhaseId }: Props) => {
  const { data: phases } = usePhases(projectId);

  if (!isNilOrError(phases)) {
    return (
      <>
        {phases.data.map((phase, phaseIndex) => {
          const phaseNumber = phaseIndex + 1;
          const isSelectedPhase = phase.id === selectedPhaseId;

          return (
            <StyledPhaseDescription
              key={phase.id}
              phaseId={phase.id}
              phaseNumber={phaseNumber}
              hasBottomMargin={
                phase?.attributes?.participation_method !== 'information'
              }
              hidden={!isSelectedPhase}
            />
          );
        })}
      </>
    );
  }

  return null;
};

export default PhaseDescriptions;
