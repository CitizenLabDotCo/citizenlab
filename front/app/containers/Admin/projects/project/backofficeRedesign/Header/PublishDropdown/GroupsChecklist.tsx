import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import useGroups from 'api/groups/useGroups';
import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import useDeleteProjectGroup from 'api/project_groups/useDeleteProjectGroup';
import useProjectGroups from 'api/project_groups/useProjectGroups';

import useLocalize from 'hooks/useLocalize';

import CheckOption from 'components/UI/PillPicker/CheckOption';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  projectId: string;
}

const GroupsChecklist = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const { data: projectGroups } = useProjectGroups({ projectId });
  const { mutate: addProjectGroup, isPending: adding } = useAddProjectGroup();
  const { mutate: deleteProjectGroup, isPending: deleting } =
    useDeleteProjectGroup({ projectId });

  if (!groups || !projectGroups) return null;

  const linkIds = new Map(
    projectGroups.data.map((link) => [
      link.relationships.group.data.id,
      link.id,
    ])
  );

  const toggle = (groupId: string) => {
    const linkId = linkIds.get(groupId);

    if (linkId) {
      deleteProjectGroup(linkId);
    } else {
      addProjectGroup({ groupId, projectId });
    }
  };

  return (
    <Box
      mt="4px"
      p="12px 8px"
      borderRadius={bo.panelBorderRadius}
      background={colors.grey50}
    >
      <Text variant="boMicro" m="0 0 4px 8px">
        {formatMessage(
          groups.data.length > 0
            ? messages.publishChooseGroups
            : messages.publishNoGroups
        )}
      </Text>
      {groups.data.map((group) => (
        <CheckOption key={group.id}>
          <CheckboxWithLabel
            p="8px"
            size="17px"
            checkedColor="primary"
            checked={linkIds.has(group.id)}
            disabled={adding || deleting}
            onChange={() => toggle(group.id)}
            label={localize(group.attributes.title_multiloc)}
          />
        </CheckOption>
      ))}
    </Box>
  );
};

export default GroupsChecklist;
