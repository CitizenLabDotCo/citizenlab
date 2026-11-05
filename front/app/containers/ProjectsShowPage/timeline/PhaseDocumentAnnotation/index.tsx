import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phase: IPhaseData;
  documentUrl: string;
}

const PhaseDocumentAnnotation = ({ phase, documentUrl }: Props) => (
  <Box position="relative" minHeight="500px">
    <Title variant="h2" mt="0" color="tenantText">
      <FormattedMessage {...messages.document} />
    </Title>

    <DocumentAnnotation phase={phase} documentUrl={documentUrl} />
  </Box>
);

export default PhaseDocumentAnnotation;
