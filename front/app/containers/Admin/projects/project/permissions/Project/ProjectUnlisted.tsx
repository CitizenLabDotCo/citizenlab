import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import { SubSectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import UnlistedInput from '../../general/components/UnlistedInput';

import messages from './messages';

interface Props {
  projectId: string;
}

const ProjectUnlisted = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();
  const { formatMessage } = useIntl();

  if (!project) {
    return null;
  }

  const { unlisted } = project.data.attributes;

  return (
    <Box>
      <SubSectionTitle>
        {formatMessage(messages.shouldProjectBeListed)}
      </SubSectionTitle>
      <Box mt="-12px" mb="40px">
        <UnlistedInput
          listed={!unlisted}
          onChange={() => {
            updateProject({ projectId, unlisted: !unlisted });
          }}
        />
      </Box>
    </Box>
  );
};

export default ProjectUnlisted;
