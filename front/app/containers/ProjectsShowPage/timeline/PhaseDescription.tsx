import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';
import PhaseTitle from './PhaseTitle';
import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import EventPreviews from 'components/EventPreviews';

// hooks
import useLocalize from 'hooks/useLocalize';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';

// style
import styled from 'styled-components';
import { defaultCardStyle, media } from '@citizenlab/cl2-component-library';
import usePhaseFiles from 'api/phase_files/usePhaseFiles';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// typings
import { IPhases } from 'api/phases/types';

const Container = styled.div<{ hasBottomMargin: boolean }>`
  padding: 30px;
  padding-bottom: 35px;
  ${defaultCardStyle};

  margin-bottom: ${(props) => (props.hasBottomMargin ? '50px' : '0px')};

  ${media.phone`
    padding: 20px;
    margin-bottom: ${(props) => (props.hasBottomMargin ? '20px' : '0px')};
  `}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  margin-bottom: 25px;
  max-width: 520px;
`;

interface Props {
  projectId: string;
  selectedPhaseId: string;
}

const getPhaseNumber = (phases: IPhases, selectedPhaseId: string) => {
  const phaseIndex = phases.data.findIndex(
    (phase) => selectedPhaseId === phase.id
  );
  return phaseIndex + 1;
};

const PhaseDescription = ({ projectId, selectedPhaseId }: Props) => {
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(selectedPhaseId);
  const { data: phaseFiles } = usePhaseFiles(selectedPhaseId);

  const isActivePhase =
    phase?.data &&
    pastPresentOrFuture([
      phase.data.attributes.start_at,
      phase.data.attributes.end_at,
    ]) === 'present';

  const phaseNumber = phases ? getPhaseNumber(phases, selectedPhaseId) : null;

  if (!phaseNumber || !phase) {
    return null;
  }

  const content = phase
    ? localize(phase.data.attributes.description_multiloc)
    : '';
  const contentIsEmpty =
    content === '' || content === '<p></p>' || content === '<p><br></p>';
  const descriptionHasContent = !contentIsEmpty || !isEmpty(phaseFiles);

  return (
    <Container
      className="e2e-phase-description"
      role="tabpanel"
      tabIndex={0}
      id={`phase-description-panel-${phaseNumber}`}
      aria-labelledby={`phase-tab-${phaseNumber}`}
      hasBottomMargin={
        phase.data.attributes.participation_method !== 'information'
      }
    >
      <PhaseTitle
        phaseNumber={phaseNumber}
        phaseId={selectedPhaseId}
        descriptionHasContent={descriptionHasContent}
      />
      {phase && descriptionHasContent && (
        <>
          <ReadMoreWrapper
            fontSize="base"
            contentId="phase-description"
            value={phase.data.attributes?.description_multiloc}
          />

          {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) && (
            <StyledFileAttachments files={phaseFiles.data} />
          )}
        </>
      )}
      {isActivePhase && (
        <EventPreviews projectId={phase?.data.relationships.project.data.id} />
      )}
    </Container>
  );
};

export default PhaseDescription;
