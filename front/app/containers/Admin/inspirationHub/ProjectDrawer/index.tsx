import React from 'react';

import { Box, StatusLabel, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import SideModal from 'components/UI/SideModal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import ExternalLink from './ExternalLink';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('project_id') ?? undefined;
  const { data: project } = useProjectLibraryProject(projectId);

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  if (!project) return null;

  const { attributes } = project.data;

  return (
    <SideModal opened={!!projectId} close={handleOnClose}>
      <Box mt="52px" mx="28px">
        <Box display="flex" flexDirection="row" alignItems="center">
          <StatusLabel
            text={attributes.tenant_population_group}
            backgroundColor={colors.coolGrey600}
            h="16px"
            w="24px"
            ml="4px"
          />
          <ExternalLink href={`/todo`} ml="8px" mt="1px">
            {attributes.tenant_name}
          </ExternalLink>
        </Box>
      </Box>
    </SideModal>
  );
};

export default ProjectDrawer;
