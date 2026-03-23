import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useGroups from 'api/groups/useGroups';
import useProjectGroups from 'api/project_groups/useProjectGroups';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

interface Props {
  project: IProjectData;
  onClose: () => void;
}

const VisibilitySection = ({ project, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const visibleTo = project.attributes.visible_to;
  const projectId = project.id;

  const { data: projectGroups } = useProjectGroups({ projectId });
  const { data: groups } = useGroups({});

  const getVisibilityLabel = () => {
    if (visibleTo === 'public') {
      return formatMessage(messages.everyone);
    }
    if (visibleTo === 'admins') {
      return formatMessage(messages.adminsOnly);
    }
    if (projectGroups && groups) {
      const groupNames = projectGroups.data
        .map((pg) => {
          const group = groups.data.find(
            (g) => g.id === pg.relationships.group.data.id
          );
          return group ? localize(group.attributes.title_multiloc) : '';
        })
        .filter(Boolean)
        .join(', ');
      return groupNames || formatMessage(messages.everyone);
    }
    return formatMessage(messages.everyone);
  };

  const handleEditClick = () => {
    clHistory.push(
      `/admin/projects/${projectId}/general/access-rights` as RouteType
    );
    onClose();
  };

  return (
    <Box mb="8px">
      <Text fontWeight="bold" mb="4px">
        {formatMessage(messages.whoCanFindProject)}
      </Text>
      <Box display="flex" alignItems="center" gap="8px">
        <Text color="grey700" fontSize="s">
          {getVisibilityLabel()}
        </Text>
        <Text color="grey700" fontSize="s">
          &middot;
        </Text>
        <Text
          color="grey700"
          fontSize="s"
          textDecoration="underline"
          style={{ cursor: 'pointer' }}
          onClick={handleEditClick}
        >
          {formatMessage(messages.edit)}
        </Text>
      </Box>
    </Box>
  );
};

export default VisibilitySection;
