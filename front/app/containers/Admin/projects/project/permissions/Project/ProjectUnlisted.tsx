import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import { SubSectionTitle } from 'components/admin/Section';

import UnlistedInput from '../../general/components/UnlistedInput';

interface Props {
  projectId: string;
}

const ProjectUnlisted = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!project) {
    return null;
  }

  const { unlisted } = project.data.attributes;

  return (
    <Box>
      <SubSectionTitle>Should the project be listed?</SubSectionTitle>
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
