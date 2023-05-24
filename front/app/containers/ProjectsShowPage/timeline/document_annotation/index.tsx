import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';
import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IPhaseData } from 'api/phases/types';
import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';
import { IProjectData } from 'api/projects/types';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const PhaseDocumentAnnotation = ({ phase, project }: Props) => {
  const documentUrl = phase.attributes.document_annotation_embed_url;

  if (documentUrl) {
    return (
      <Box position="relative" minHeight="500px">
        <ProjectPageSectionTitle>
          <FormattedMessage {...messages.document} />
        </ProjectPageSectionTitle>

        <DocumentAnnotation
          documentUrl={documentUrl}
          project={project}
          phaseId={phase.id}
        />
      </Box>
    );
  }

  return null;
};

export default PhaseDocumentAnnotation;
