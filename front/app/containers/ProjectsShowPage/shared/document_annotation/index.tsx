import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';
import Konveio from './Konveio';

import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import useProjectById from 'api/projects/useProjectById';

interface Props {
  projectId: string;
}

const DocumentAnnotation = ({ projectId }: Props) => {
  const authUser = useAuthUser();
  const { data: project } = useProjectById(projectId);

  if (!isNilOrError(project)) {
    const documentUrl = project.data.attributes.document_annotation_embed_url;
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
        <Box position="relative" minHeight="500px">
          <ProjectPageSectionTitle>
            <FormattedMessage {...messages.document} />
          </ProjectPageSectionTitle>

          <Konveio documentUrl={documentUrl} email={email} />
        </Box>
      );
    }

    return null;
  }

  return null;
};

export default DocumentAnnotation;
