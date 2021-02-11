// Libraries
import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { find, map } from 'lodash-es';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';
import GroupAvatar from './GroupAvatar';
import { List, Row } from 'components/admin/ResourceList';

// Services
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/tenant';
import { getGroups, IGroups, IGroupData } from 'services/groups';
import {
  addGroupProject,
  deleteGroupProject,
  groupsProjectsByProjectIdStream,
  IGroupsProjects,
} from 'services/groupsProjects';

// Style
import styled from 'styled-components';

// Typings
import { IOption, Locale } from 'typings';

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

interface IProjectGroup {
  group_id: string;
  group_project_id: string;
  title: string;
  membership_count: number;
}

interface Props {
  projectId: string;
  onAddButtonClicked: () => void;
}

interface State {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  groupsOptions: IOption[] | null;
  projectGroups: IProjectGroup[] | null;
  selectedGroups: IOption[] | null;
  loading: boolean;
}

class ProjectGroupsList extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      groupsOptions: null,
      projectGroups: null,
      selectedGroups: null,
      loading: true,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;
    const groups$ = getGroups().observable;
    const groupsProjects$ = groupsProjectsByProjectIdStream(projectId)
      .observable;

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$,
        groups$,
        groupsProjects$
      ).subscribe(([locale, currentTenant, groups, groupsProjects]) => {
        const currentTenantLocales =
          currentTenant.data.attributes.settings.core.locales;
        const projectGroups = map(groupsProjects.data, (groupProject) => {
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
        }).reverse();
        const groupsOptions = this.getOptions(
          groups,
          groupsProjects,
          locale,
          currentTenantLocales
        );
        const loading = false;

        this.setState({
          locale,
          currentTenantLocales,
          projectGroups,
          groupsOptions,
          loading,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleGroupsOnChange = (selectedGroups: IOption[]) => {
    this.setState({ selectedGroups });
  };

  handleOnAddGroupClick = async () => {
    const { projectId } = this.props;
    const { selectedGroups } = this.state;

    if (selectedGroups && selectedGroups.length > 0) {
      const promises = selectedGroups.map((selectedGroup) =>
        addGroupProject(projectId, selectedGroup.value)
      );

      try {
        await Promise.all(promises);
        this.setState({ selectedGroups: null });
        this.props.onAddButtonClicked();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
      }
    }
  };

  getOptions = (
    groups: IGroups | null,
    groupsProjects: IGroupsProjects,
    locale: Locale,
    currentTenantLocales: Locale[]
  ) => {
    if (groupsProjects && groups) {
      return groups.data
        .filter((group) => {
          return !groupsProjects.data.some(
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

  createDeleteGroupHandler = (groupProjectId: string) => {
    const deletionMessage = this.props.intl.formatMessage(
      messages.groupDeletionConfirmation
    );

    return (event) => {
      event.preventDefault();

      if (window.confirm(deletionMessage)) {
        deleteGroupProject(groupProjectId);
      }
    };
  };

  render() {
    const { formatMessage } = this.props.intl;
    const {
      groupsOptions,
      projectGroups,
      selectedGroups,
      loading,
    } = this.state;
    const groupsMultipleSelectPlaceholder = formatMessage(
      messages.groupsMultipleSelectPlaceholder
    );

    const selectGroups = !loading ? (
      <SelectGroupsContainer>
        <StyledMultipleSelect
          options={groupsOptions}
          value={selectedGroups}
          onChange={this.handleGroupsOnChange}
          placeholder={groupsMultipleSelectPlaceholder}
        />

        <AddGroupButton
          text={formatMessage(messages.add)}
          buttonStyle="cl-blue"
          icon="plus-circle"
          onClick={this.handleOnAddGroupClick}
          disabled={!selectedGroups || selectedGroups.length === 0}
        />
      </SelectGroupsContainer>
    ) : null;

    const groupsList =
      !loading && projectGroups && projectGroups.length > 0 ? (
        <List>
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
                onClick={this.createDeleteGroupHandler(
                  projectGroup.group_project_id
                )}
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
  }
}

export default injectIntl<Props>(ProjectGroupsList);
