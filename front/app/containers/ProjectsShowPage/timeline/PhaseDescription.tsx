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
import usePhase from 'api/phases/usePhase';

// style
import styled from 'styled-components';
import { defaultCardStyle, media } from 'utils/styleUtils';
import usePhaseFiles from 'api/phase_files/usePhaseFiles';

// utils
import { isCurrentPhase } from 'api/phases/utils';

const Container = styled.div`
  padding: 30px;
  padding-bottom: 35px;
  ${defaultCardStyle};

  ${media.phone`
    padding: 20px;
  `}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  margin-bottom: 25px;
  max-width: 520px;
`;

interface Props {
  phaseId: string | null;
  phaseNumber: number;
  className?: string;
  hidden: boolean;
}

const PhaseDescription = ({
  phaseId,
  phaseNumber,
  className,
  hidden,
}: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data: phaseFiles } = usePhaseFiles(phaseId);
  const isActivePhase = phase?.data && isCurrentPhase(phase?.data);

  const content = phase
    ? localize(phase.data.attributes.description_multiloc)
    : '';
  const contentIsEmpty =
    content === '' || content === '<p></p>' || content === '<p><br></p>';
  const descriptionHasContent = !contentIsEmpty || !isEmpty(phaseFiles);

  return (
    <>
      <Container
        className={`e2e-phase-description ${className || ''}`}
        role="tabpanel"
        tabIndex={0}
        id={`phase-description-panel-${phaseNumber}`}
        aria-labelledby={`phase-tab-${phaseNumber}`}
        hidden={hidden}
      >
        <PhaseTitle
          phaseNumber={phaseNumber}
          phaseId={phaseId}
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
          <EventPreviews
            projectId={phase?.data.relationships.project.data.id}
          />
        )}
      </Container>
    </>
  );
};

export default PhaseDescription;
