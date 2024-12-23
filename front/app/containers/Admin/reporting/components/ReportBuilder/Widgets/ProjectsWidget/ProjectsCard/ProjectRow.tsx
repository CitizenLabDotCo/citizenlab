import React from 'react';

import {
  Box,
  Title,
  Image,
  Text,
  stylingConsts,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { Period } from 'api/graph_data_units/responseTypes/ProjectsWidget';
import { IProjectImageData } from 'api/project_images/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import messages from '../messages';

import { deriveProjectStatus, ProjectStatus } from './utils';

interface Props {
  project: IProjectData;
  projectImage?: IProjectImageData;
  period: Period;
  participants?: number;
}

const MESSAGES: Record<ProjectStatus, MessageDescriptor> = {
  finished: messages.finished,
  active: messages.active,
  'open-ended': messages.openEnded,
  planned: messages.planned,
};

const LABEL_STYLE: Record<
  ProjectStatus,
  { background: string; color: string }
> = {
  finished: {
    background: colors.teal100,
    color: colors.teal500,
  },
  active: {
    background: colors.green100,
    color: colors.green500,
  },
  'open-ended': {
    background: colors.grey100,
    color: colors.coolGrey600,
  },
  planned: {
    background: colors.orange100,
    color: colors.orange500,
  },
};

const ProjectRow = ({ project, projectImage, period, participants }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const startMonth = toFullMonth(period.start_at, 'month');
  const endMonth = period.end_at
    ? toFullMonth(period.end_at, 'month')
    : undefined;

  const { title_multiloc } = project.attributes;

  const status = deriveProjectStatus(period, moment());
  const labelStyle = LABEL_STYLE[status];

  return (
    <Box display="flex" flexDirection="row" pb="16px">
      {projectImage?.attributes.versions.large ? (
        <Image
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          src={projectImage?.attributes.versions.large}
          alt={''}
          w="52px"
          h="52px"
          objectFit="cover"
          borderRadius={stylingConsts.borderRadius}
          mr="20px"
        />
      ) : (
        <Box
          display="flex"
          w="52px"
          h="52px"
          background={colors.grey300}
          mr="20px"
          borderRadius={stylingConsts.borderRadius}
        >
          <Icon
            name="building"
            width="52px"
            height="52px"
            transform="translate(1,0)"
            fill={colors.white}
          />
        </Box>
      )}
      <Box>
        <Title variant="h5" m="0">
          {localize(title_multiloc)}
        </Title>
        <Box display="flex" mt="8px" alignItems="center">
          <Box
            background={labelStyle.background}
            mr="6px"
            pt="1px"
            pb="0px"
            pr="9px"
            pl="6px"
            borderRadius="3px"
            style={{
              color: labelStyle.color,
              fontWeight: '700',
              fontSize: '12px',
            }}
          >
            <Icon
              name="dot"
              width="14px"
              transform="translate(0,-1)"
              fill={labelStyle.color}
              mr="2px"
            />
            {formatMessage(MESSAGES[status]).toUpperCase()}
          </Box>
          •
          <Box mx="6px">
            <Icon name="user" width="18px" transform="translate(0,-2)" />
            {participants ?? 0}
          </Box>
          •
          <Text ml="6px" fontSize="s" m="0">
            {startMonth} → {endMonth ?? '...'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectRow;
