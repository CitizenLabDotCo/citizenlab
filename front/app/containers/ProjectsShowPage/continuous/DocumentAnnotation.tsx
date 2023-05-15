import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';

// components
import ContentContainer from 'components/ContentContainer';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  maxPageWidth,
  ProjectPageSectionTitle,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';
import { Box } from '@citizenlab/cl2-component-library';
import Konveio from '../shared/document_annotation/Konveio';

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

const DocumentAnnotation = ({ project, className }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const documentUrl = project.attributes.document_annotation_embed_url;
  const email =
    !isNilOrError(authUser) && authUser.attributes.email
      ? authUser.attributes.email
      : null;

  // const { enabled, disabledReason } = getSurveyTakingRules({
  //   project,
  //   phaseContext: !isError(phase) ? phase : null,
  //   signedIn: !isNilOrError(authUser),
  // });

  if (documentUrl) {
    return (
      <Box
        className={`e2e-continuous-project-document-annotation-container ${
          className || ''
        }`}
        background={colors.background}
      >
        <ContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <ScreenReaderOnly>
              <h2>{formatMessage(messages.invisbleTitleDocumentAnnotation)}</h2>
            </ScreenReaderOnly>
            <Box
              id="project-survey"
              className={`${className} e2e-document-annotation`}
            >
              <ProjectPageSectionTitle>
                {formatMessage(messages.document)}
              </ProjectPageSectionTitle>

              <Konveio documentUrl={documentUrl} email={email} />
            </Box>
          </SectionContainer>
        </ContentContainer>
      </Box>
    );
  }

  return null;
};

export default DocumentAnnotation;
