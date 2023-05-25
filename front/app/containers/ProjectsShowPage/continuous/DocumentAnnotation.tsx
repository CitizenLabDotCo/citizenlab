import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  maxPageWidth,
  ProjectPageSectionTitle,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';
import { Box } from '@citizenlab/cl2-component-library';
import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import { colors } from 'utils/styleUtils';
import { IProjectData } from 'api/projects/types';

interface Props {
  project: IProjectData;
  className?: string;
}

const ContinuousDocumentAnnotation = ({ project, className }: Props) => {
  const { formatMessage } = useIntl();
  const documentUrl = project.attributes.document_annotation_embed_url;

  if (documentUrl) {
    return (
      <Box className={className} background={colors.background}>
        <ContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <ScreenReaderOnly>
              <h2>{formatMessage(messages.invisbleTitleDocumentAnnotation)}</h2>
            </ScreenReaderOnly>
            <Box
              id="document-annotation"
              className={`${className} e2e-document-annotation`}
            >
              <ProjectPageSectionTitle>
                {formatMessage(messages.document)}
              </ProjectPageSectionTitle>

              <DocumentAnnotation
                documentUrl={documentUrl}
                project={project}
                phaseId={null}
              />
            </Box>
          </SectionContainer>
        </ContentContainer>
      </Box>
    );
  }

  return null;
};

export default ContinuousDocumentAnnotation;
