import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';
import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { IPhaseData } from 'api/phases/types';
import DocumentAnnotation from 'containers/ProjectsShowPage/shared/document_annotation';

interface Props {
  phase: IPhaseData;
}

const PhaseDocumentAnnotation = ({ phase }: Props) => {
  const authUser = useAuthUser();

  const documentUrl = phase.attributes.document_annotation_embed_url;
  const email =
    !isNilOrError(authUser) && authUser.attributes.email
      ? authUser.attributes.email
      : null;

  if (documentUrl) {
    return (
      <Box position="relative" minHeight="500px">
        <ProjectPageSectionTitle>
          <FormattedMessage {...messages.document} />
        </ProjectPageSectionTitle>

        <DocumentAnnotation documentUrl={documentUrl} email={email} />
      </Box>
    );
  }

  return null;
};

export default PhaseDocumentAnnotation;
