import React from 'react';

import { Tooltip, Box, Text } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import GanttItemIconBar from 'components/UI/GanttChart/components/GanttItemIconBar';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { getStatusColor } from '../../_shared/utils';
import { VISIBILITY_LABELS } from '../constants';

import messages from './messages';

const PUBLICATION_STATUSES: Record<PublicationStatus, MessageDescriptor> = {
  draft: messages.draft,
  published: messages.published,
  archived: messages.archived,
};

interface Props {
  project: ProjectMiniAdminData;
}

const Visibility = ({ project }: Props) => {
  const { formatMessage } = useIntl();

  const { publication_status, visible_to } = project.attributes;

  return (
    <Tooltip
      content={
        <Box>
          <Box>
            <Text
              m="0"
              mr="4px"
              fontSize="s"
              display="inline-block"
              fontWeight="bold"
              color="white"
            >
              {formatMessage(messages.statusColon)}
            </Text>
            <Text m="0" fontSize="s" display="inline-block" color="white">
              {formatMessage(PUBLICATION_STATUSES[publication_status])}
            </Text>
          </Box>
          <Box mt="20px">
            <Text
              m="0"
              mr="4px"
              fontSize="s"
              display="inline-block"
              fontWeight="bold"
              color="white"
            >
              {formatMessage(messages.visibilityColon)}
            </Text>
            {visible_to === 'groups' ? (
              <></>
            ) : (
              <Text m="0" fontSize="s" color="white" display="inline-block">
                {formatMessage(VISIBILITY_LABELS[visible_to])}
              </Text>
            )}
          </Box>
        </Box>
      }
      theme="dark"
    >
      <Box display="flex">
        <GanttItemIconBar
          color={getStatusColor(publication_status)}
          rowHeight={32}
          ml="0"
          mr="8px"
        />
        <Box>
          <Text m="0" fontSize="s" display="inline-block">
            {formatMessage(PUBLICATION_STATUSES[publication_status])}
          </Text>
          <Text m="0" fontSize="xs" color="textSecondary">
            {visible_to === 'groups' ? (
              <>
                {formatMessage(messages.xGroups, {
                  numberOfGroups: project.relationships.groups.data.length,
                })}
              </>
            ) : (
              <>{formatMessage(VISIBILITY_LABELS[visible_to])}</>
            )}
          </Text>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default Visibility;
