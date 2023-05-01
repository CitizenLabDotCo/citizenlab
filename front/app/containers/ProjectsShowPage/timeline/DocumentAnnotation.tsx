import React from 'react';
import DocumentAnnotation from '../shared/document_annotation';
import usePhase from 'hooks/usePhase';
import { isNilOrError } from 'utils/helperUtils';
import { Box } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  className?: string;
  projectId: string;
  phaseId: string;
}

const DocumentAnnotationContainer = ({
  className,
  phaseId,
  projectId,
}: Props) => {
  const phase = usePhase(phaseId);

  if (
    !isNilOrError(phase) &&
    phase.attributes.participation_method === 'survey' &&
    phase.attributes.survey_embed_url &&
    phase.attributes.survey_service
  ) {
    return (
      <Box className={className || ''}>
        <ScreenReaderOnly>
          <FormattedMessage
            tagName="h3"
            {...messages.invisbleTitleDocumentAnnotation}
          />
        </ScreenReaderOnly>
        <DocumentAnnotation projectId={projectId} />
      </Box>
    );
  }
  return null;
};

export default DocumentAnnotationContainer;
