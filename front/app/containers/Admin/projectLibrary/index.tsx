import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import messages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

const ProjectLibrary = () => {
  const { data: libraryProjects } = useProjectLibraryProjects({});
  console.log({ libraryProjects });

  return (
    <Box>
      <Title variant="h1" color="primary">
        <FormattedMessage {...messages.projectLibrary} />
      </Title>
      <ul>
        {libraryProjects?.data.map((project) => (
          <li key={project.id}>{project.attributes.title_en}</li>
        ))}
      </ul>
    </Box>
  );
};

export default ProjectLibrary;
