import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  project: IProjectData;
}

const ProjectRow = ({ project }: Props) => {
  const localize = useLocalize();

  return (
    <Box>
      <Title variant="h5">{localize(project.attributes.title_multiloc)}</Title>
    </Box>
  );
};

export default ProjectRow;
