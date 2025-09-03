import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';

import { FormattedMessage } from 'utils/cl-intl';

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
        <Title variant="h2" mt="0" color="tenantText">
          <FormattedMessage {...messages.document} />
        </Title>

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
