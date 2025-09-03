import React from 'react';

import { Tooltip, Box, Text } from '@citizenlab/cl2-component-library';

import { IGroupData } from 'api/groups/types';
import useGroupsByIds from 'api/groups/useGroupsByIds';
import { PublicationStatus } from 'api/projects/types';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import GanttItemIconBar from 'components/UI/GanttChart/components/GanttItemIconBar';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import { getStatusColor } from '../../_shared/utils';
import { VISIBILITY_LABELS } from '../constants';

import messages from './messages';
import tracks from './tracks';

const PUBLICATION_STATUSES: Record<PublicationStatus, MessageDescriptor> = {
  draft: sharedMessages.draft,
  published: sharedMessages.published,
  archived: sharedMessages.archived,
};

interface Props {
  project: ProjectMiniAdminData;
}

const Visibility = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { publication_status, visible_to, listed } = project.attributes;
  const groupIds = project.relationships.groups.data.map((group) => group.id);

  const groupsData = useGroupsByIds(groupIds);
  const groups = groupsData
    .map((query) => query?.data)
    .filter((data): data is IGroupData => data !== undefined);

  const groupNames = groups
    .slice(0, 3) // Limit to first 3 groups
    .map((group) => localize(group.attributes.title_multiloc))
    .join(', ');

  const hiddenStatusText = !listed
    ? ` • ${formatMessage(messages.hidden)}`
    : '';

  return (
    <Tooltip
      content={
        <Box maxWidth="240px">
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
              <Text m="0" color="white" fontSize="s" display="inline-block">
                {groupNames}
                {groups.length > 3 ? '...' : ''}
              </Text>
            ) : (
              <Text m="0" fontSize="s" color="white" display="inline-block">
                {formatMessage(VISIBILITY_LABELS[visible_to])}
              </Text>
            )}
          </Box>
          <Box mt="20px">
            <Text
              m="0"
              mr="4px"
              fontSize="s"
              fontWeight="bold"
              color="white"
              display="inline-block"
            >
              {formatMessage(messages.discoverability)}
            </Text>
            <Text m="0" color="white" fontSize="s" display="inline-block">
              {formatMessage(listed ? messages.listed : messages.unlisted)}
            </Text>
          </Box>
        </Box>
      }
      theme="dark"
      onShow={() => {
        trackEventByName(tracks.visibilityTooltip, {
          projectId: project.id,
        });
      }}
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
                  numberOfGroups: groupIds.length,
                })}
                {hiddenStatusText}
              </>
            ) : (
              <>
                {formatMessage(VISIBILITY_LABELS[visible_to])}
                {hiddenStatusText}
              </>
            )}
          </Text>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default Visibility;
