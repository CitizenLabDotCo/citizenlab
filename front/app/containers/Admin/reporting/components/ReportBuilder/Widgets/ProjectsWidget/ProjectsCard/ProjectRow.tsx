import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  project: IProjectData;
}

const ProjectRow = ({ project }: Props) => {
  const localize = useLocalize();

  return <Box>{localize(project.attributes.title_multiloc)}</Box>;
};

export default ProjectRow;
