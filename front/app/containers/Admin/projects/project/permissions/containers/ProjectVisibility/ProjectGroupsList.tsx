// Libraries
import React, { useState } from 'react';
import { find } from 'lodash-es';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';
import GroupAvatar from './GroupAvatar';
import { List, Row } from 'components/admin/ResourceList';

// Style
import styled from 'styled-components';

// Typings
import { IOption, Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// Api
import useProjectGroups from 'api/project_groups/useProjectGroups';
import useGroups from 'api/groups/useGroups';
import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import { IProjectGroupData } from 'api/project_groups/types';
import { IGroups, IGroupData } from 'api/groups/types';
import useDeleteProjectGroup from 'api/project_groups/useDeleteProjectGroup';

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

const AddGroupButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 30px;
`;

const GroupTitle = styled.p``;

const GroupMembershipCount = styled.p``;

interface Props {
  projectId: string;
  onAddButtonClicked: () => void;
}

const ProjectGroupsList = ({ projectId, onAddButtonClicked }: Props) => {
  const { mutateAsync: addProjectGroup } = useAddProjectGroup();
  const { mutate: deleteProjectGroup } = useDeleteProjectGroup({ projectId });
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const currentTenantLocales = useAppConfigurationLocales();

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
        title: getLocalized(
          group.attributes.title_multiloc,
          locale,
          currentTenantLocales
        ),
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

        onAddButtonClicked();
      } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.log(error);
      }
    }
  };

  const getOptions = (
    groups: IGroups | null,
    groupsProjects: IProjectGroupData[],
    locale: Locale,
    currentTenantLocales: Locale[]
  ) => {
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
          label: getLocalized(
            group.attributes.title_multiloc,
            locale,
            currentTenantLocales
          ),
        }));
    }

    return null;
  };

  if (
    isNilOrError(groupsProjects) ||
    isNilOrError(locale) ||
    isNilOrError(currentTenantLocales)
  ) {
    return null;
  }

  const groupsOptions = getOptions(
    groups || null,
    groupsProjects.data,
    locale,
    currentTenantLocales
  );

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
        buttonStyle="cl-blue"
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
            <Button
              onClick={createDeleteGroupHandler(projectGroup.group_project_id)}
              buttonStyle="text"
              icon="delete"
            >
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
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
