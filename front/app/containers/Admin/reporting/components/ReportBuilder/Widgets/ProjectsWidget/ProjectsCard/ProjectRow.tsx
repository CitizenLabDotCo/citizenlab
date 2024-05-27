import React from 'react';

import {
  Box,
  Title,
  Image,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';

import { IProjectImageData } from 'api/project_images/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import messages from '../messages';

interface Props {
  project: IProjectData;
  projectImage?: IProjectImageData;
  periods: { start_at: string; end_at: string | null };
  first?: boolean;
}

const ProjectRow = ({ project, projectImage, periods, first }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const startMonth = toFullMonth(periods.start_at, 'month');
  const endMonth = periods.end_at
    ? toFullMonth(periods.end_at, 'month')
    : formatMessage(messages.noEndDate);

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
        <Text fontSize="s">
          {startMonth} - {endMonth}
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectRow;
