import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

import { FormattedMessage } from 'utils/cl-intl';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import messages from './messages';

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
          project={project}
          phaseId={phase.id}
          documentUrl={documentUrl}
        />
      </Box>
    );
  }

  return null;
};

export default PhaseDocumentAnnotation;
