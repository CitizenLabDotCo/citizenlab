import React, { useState } from 'react';

import { find } from 'lodash-es';
import styled from 'styled-components';
import { IOption } from 'typings';

import { IGroups, IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';
import { IProjectGroupData } from 'api/project_groups/types';
import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import useDeleteProjectGroup from 'api/project_groups/useDeleteProjectGroup';
import useProjectGroups from 'api/project_groups/useProjectGroups';

import useLocalize from 'hooks/useLocalize';

import { List, Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import MultipleSelect from 'components/UI/MultipleSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import GroupAvatar from './GroupAvatar';
import messages from './messages';

const Container = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SelectGroupsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  min-width: 300px;
  z-index: 5;
`;

const AddGroupButton = styled(ButtonWithLink)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 30px;
`;

const GroupTitle = styled.p``;

const GroupMembershipCount = styled.p``;

interface Props {
  projectId: string;
}

const ProjectGroupsList = ({ projectId }: Props) => {
  const localize = useLocalize();
  const { mutateAsync: addProjectGroup } = useAddProjectGroup();
  const { mutate: deleteProjectGroup } = useDeleteProjectGroup({ projectId });
  const { formatMessage } = useIntl();
  const { data: groupsProjects } = useProjectGroups({ projectId });
  const [selectedGroups, setSelectedGroups] = useState<IOption[] | null>(null);
  const { data: groups } = useGroups({});

  const projectGroups =
    groupsProjects &&
    groups &&
    groupsProjects.data.map((groupProject) => {
      const group = find(
        groups.data,
        (group) => group.id === groupProject.relationships.group.data.id
      ) as IGroupData;
      return {
        group_id: group.id,
        group_project_id: groupProject.id,
        title: localize(group.attributes.title_multiloc),
        membership_count: group.attributes.memberships_count,
      };
    });

  const handleGroupsOnChange = (selectedGroups: IOption[]) => {
    setSelectedGroups(selectedGroups);
  };

  const handleOnAddGroupClick = async () => {
    if (selectedGroups && selectedGroups.length > 0) {
      const promises = selectedGroups.map((selectedGroup) =>
        addProjectGroup({ projectId, groupId: selectedGroup.value })
      );

      try {
        await Promise.all(promises);
        setSelectedGroups(null);
      } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.log(error);
      }
    }
  };

  const getOptions = (
    groups: IGroups | null,
    groupsProjects: IProjectGroupData[]
  ) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (groupsProjects && groups) {
      return groups.data
        .filter((group) => {
          return !groupsProjects.some(
            (groupProject) =>
              groupProject.relationships.group.data.id === group.id
          );
        })
        .map((group) => ({
          value: group.id,
          label: localize(group.attributes.title_multiloc),
        }));
    }

    return null;
  };

  if (!groupsProjects) {
    return null;
  }

  const groupsOptions = getOptions(groups || null, groupsProjects.data);

  const createDeleteGroupHandler = (groupProjectId: string) => {
    const deletionMessage = formatMessage(messages.groupDeletionConfirmation);

    return (event) => {
      event.preventDefault();

      if (window.confirm(deletionMessage)) {
        deleteProjectGroup(groupProjectId);
      }
    };
  };

  const groupsMultipleSelectPlaceholder = formatMessage(
    messages.groupsMultipleSelectPlaceholder
  );

  const selectGroups = (
    <SelectGroupsContainer>
      <StyledMultipleSelect
        options={groupsOptions}
        value={selectedGroups}
        onChange={handleGroupsOnChange}
        placeholder={groupsMultipleSelectPlaceholder}
      />

      <AddGroupButton
        text={formatMessage(messages.add)}
        buttonStyle="admin-dark"
        icon="plus-circle"
        onClick={handleOnAddGroupClick}
        disabled={!selectedGroups || selectedGroups.length === 0}
      />
    </SelectGroupsContainer>
  );

  const groupsList =
    projectGroups && projectGroups.length > 0 ? (
      <List key={projectGroups.length}>
        {projectGroups.map((projectGroup, index) => (
          <Row
            key={projectGroup.group_project_id}
            isLastItem={index === projectGroups.length - 1}
          >
            <GroupAvatar groupId={projectGroup.group_id} />
            <GroupTitle className="expand">{projectGroup.title}</GroupTitle>
            <GroupMembershipCount className="expand">
              <FormattedMessage
                {...messages.members}
                values={{ count: projectGroup.membership_count }}
              />
            </GroupMembershipCount>
            <ButtonWithLink
              onClick={createDeleteGroupHandler(projectGroup.group_project_id)}
              buttonStyle="text"
              icon="delete"
            >
              <FormattedMessage {...messages.deleteButtonLabel} />
            </ButtonWithLink>
          </Row>
        ))}
      </List>
    ) : null;

  return (
    <Container>
      {selectGroups}
      {groupsList}
    </Container>
  );
};

export default ProjectGroupsList;
