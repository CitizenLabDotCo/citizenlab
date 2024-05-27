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
  period: { start_at: string; end_at: string | null };
  participants: number;
  first?: boolean;
}

const ProjectRow = ({
  project,
  projectImage,
  period,
  participants,
  first,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const startMonth = toFullMonth(period.start_at, 'month');
  const endMonth = period.end_at
    ? toFullMonth(period.end_at, 'month')
    : formatMessage(messages.noEndDate);

  const { title_multiloc, ideas_count, comments_count } = project.attributes;

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
          {localize(title_multiloc)}
        </Title>
        <Text fontSize="s">
          {startMonth} - {endMonth}
        </Text>
        <Text fontSize="s">
          {formatMessage(messages.xParticipants, { participants })}
          {' • '}
          {formatMessage(messages.xIdeas, { ideas: ideas_count })}
          {' • '}
          {formatMessage(messages.xComments, { comments: comments_count })}
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectRow;
