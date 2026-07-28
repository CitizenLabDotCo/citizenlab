import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phase: IPhaseData;
}

const PhaseDocumentAnnotation = ({ phase }: Props) => {
  const documentUrl = phase.attributes.document_annotation_embed_url;

  if (documentUrl) {
    return (
      <Box position="relative" minHeight="500px">
        <Title variant="h2" mt="0" color="tenantText">
          <FormattedMessage {...messages.document} />
        </Title>

        <DocumentAnnotation phase={phase} documentUrl={documentUrl} />
      </Box>
    );
  }

  return null;
};

export default PhaseDocumentAnnotation;
