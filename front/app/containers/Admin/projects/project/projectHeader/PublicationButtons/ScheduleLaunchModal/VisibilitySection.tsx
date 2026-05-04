import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useGroups from 'api/groups/useGroups';
import useProjectGroups from 'api/project_groups/useProjectGroups';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

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
      return groupNames;
    }
    return formatMessage(messages.everyone);
  };

  return (
    <Box mb="8px">
      <Text fontWeight="bold" mb="4px">
        {formatMessage(messages.whoCanFindProject)}
      </Text>
      <Box display="flex" alignItems="center" gap="4px">
        <Text color="textSecondary" fontSize="s" m="0px">
          {getVisibilityLabel()}
        </Text>
        <Text color="textSecondary" fontSize="s" m="0px">
          &middot;
        </Text>
        <ButtonWithLink
          buttonStyle="text"
          to="/admin/projects/$projectId/general/access-rights"
          params={{ projectId }}
          onClick={() => onClose()}
          padding="0"
          fontSize="14px"
          textDecoration="underline"
        >
          {formatMessage(messages.edit)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default VisibilitySection;
