import React from 'react';

import {
  Box,
  Title,
  Image,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';

import { IProjectImageData } from 'api/project_images/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

// import { toFullMonth } from 'utils/dateUtils';

interface Props {
  project: IProjectData;
  projectImage?: IProjectImageData;
  periods: { start_at: string; end_at: string | null };
  first?: boolean;
}

const ProjectRow = ({ project, projectImage, periods, first }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      display="flex"
      flexDirection="row"
      pt={first ? '0' : '28px'}
      pb="28px"
      borderBottom={`1px solid ${colors.divider}`}
    >
      {projectImage?.attributes.versions.large && (
        <Image
          src={projectImage?.attributes.versions.large}
          alt={''}
          w="100px"
          h="100px"
          objectFit="cover"
          borderRadius={stylingConsts.borderRadius}
          mr="20px"
        />
      )}
      <Box>
        <Title variant="h5" m="0">
          {localize(project.attributes.title_multiloc)}
        </Title>
        {periods.start_at} - {periods.end_at}
      </Box>
    </Box>
  );
};

export default ProjectRow;
