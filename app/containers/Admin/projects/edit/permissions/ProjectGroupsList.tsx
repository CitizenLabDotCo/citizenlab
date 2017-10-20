// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import MultipleSelect from 'components/UI/MultipleSelect';
import GroupAvatar from 'containers/Admin/groups/all/GroupAvatar';
import { List, Row } from 'components/admin/ResourceList';

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectByIdStream, IProject } from 'services/projects';
import { listGroups, IGroups, IGroupData } from 'services/groups';
import { addGroupProject, deleteGroupProject, groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

// Style
import styled from 'styled-components';
import { transparentize } from 'polished';

// Typings
import { IOption } from 'typings';

const EmptyStateMessage = styled.p`
  color: ${props => props.theme.colors.clBlue};
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 5px;
  background: ${props => transparentize(0.93, props.theme.colors.clBlue)};
`;

const StyledIcon = styled(Icon)`
  height: 1em;
  margin-right: 2rem;
`;

const Container = styled.div`
  width: 100%;
`;

const SelectGroupsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  min-width: 300px;
`;

const AddGroupButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 40px;
`;

const StyledRow = styled(Row)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledGroupAvatar = styled(GroupAvatar)``;

const GroupTitle = styled.div``;

const GroupMembershipCount = styled.div``;

const StyledList = styled(List)`
  ${GroupTitle},
  ${GroupMembershipCount} {
    color: #444;
    font-size: 16px;
    line-height: 20px;
    font-weight: 400;
  }
`;

// Typing
interface Props {
  projectId: string;
}

interface State {
  locale: string | null;
  currentTenant: ITenant | null;
  groups: IGroups | null;
  groupsOptions: IOption[] | null;
  groupsProjects: IGroupsProjects | null;
  selectedGroups: IOption[] | null;
}

class ProjectGroupsList extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenant: null,
      groups: null,
      groupsOptions: null,
      groupsProjects: null,
      selectedGroups: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectByIdStream(projectId).observable;
    const groups$ = listGroups().observable;
    const groupsProjects$ = groupsProjectsByProjectIdStream(projectId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        groups$,
        groupsProjects$
      ).subscribe(([locale, currentTenant, groups, groupsProjects]) => {
        this.setState({ 
          locale,
          currentTenant,
          groupsProjects,
          groups,
          groupsOptions: this.getOptions(groups, groupsProjects, locale, currentTenant.data.attributes.settings.core.locales)
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleGroupsOnChange = (selectedGroups: IOption[]) => {
    this.setState({ selectedGroups  });
  }

  handleOnAddGroupClick = async () => {
    const { projectId } = this.props;
    const { selectedGroups } = this.state;

    if (selectedGroups && selectedGroups.length > 0) {
      const promises = selectedGroups.map(selectedGroup => addGroupProject(projectId, selectedGroup.value));

      try {
        await Promise.all(promises);
        this.setState({ selectedGroups: null });
      } catch (error) {
        console.log(error);
      }
    }
  }

  getOptions = (groups: IGroups | null, groupsProjects: IGroupsProjects, locale: string, currentTenantLocales: string[]) => {
    if (groupsProjects && groups) {
      return groups.data.filter((group) => {
        return !groupsProjects.data.some(groupProject => groupProject.relationships.group.data.id === group.id);
      }).map((group) => ({
        value: group.id,
        label: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales)
      }));
    }

    return null;
  }

  createDeleteGroupHandler = (groupProjectId: string) => {
    const deletionMessage = this.props.intl.formatMessage(messages.groupDeletionConfirmation);

    return (event) => {
      event.preventDefault();

      if (window.confirm(deletionMessage)) {
        deleteGroupProject(groupProjectId);
      }
    };
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { locale, currentTenant, groups, groupsOptions, groupsProjects, selectedGroups } = this.state;
    const groupsMultipleSelectPlaceholder = formatMessage(messages.groupsMultipleSelectPlaceholder);
    let groupsList: JSX.Element | null = null;

    const noGroups = (!groupsProjects ? (
      <EmptyStateMessage>
        <StyledIcon name="warning" />
        <FormattedHTMLMessage {...messages.noSelectedGroupsMessage} />
      </EmptyStateMessage>
    ) : null);

    const selectGroups = ((!!locale && !!currentTenant) ? (
      <SelectGroupsContainer>
        <StyledMultipleSelect
          options={groupsOptions}
          value={selectedGroups}
          onChange={this.handleGroupsOnChange}
          placeholder={groupsMultipleSelectPlaceholder}
        />

        <AddGroupButton
          text={formatMessage(messages.addGroup)}
          style="cl-blue"
          size="2"
          icon="plus-circle"
          onClick={this.handleOnAddGroupClick}
          circularCorners={false}
          disabled={!selectedGroups || selectedGroups.length === 0}
        />
      </SelectGroupsContainer>
    ) : null);

    if (locale && currentTenant && groups && groupsProjects) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const projectGroups = groupsProjects.data.map((groupProject) => {
        const group = groups.data.find(group => group.id === groupProject.relationships.group.data.id) as IGroupData;

        return {
          group_id: group.id,
          group_project_id: groupProject.id,
          title: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales),
          membership_count: group.attributes.memberships_count
        };
      }).reverse();

      groupsList = (
        <StyledList>
          {projectGroups.map((projectGroup) => (
            <StyledRow key={projectGroup.group_id}>
              <StyledGroupAvatar groupId={projectGroup.group_id} />
              <GroupTitle className="expand">
                {projectGroup.title}
              </GroupTitle>
              <GroupMembershipCount className="expand">
                <FormattedMessage {...messages.members} values={{ count: projectGroup.membership_count }} />
              </GroupMembershipCount>
              <Button onClick={this.createDeleteGroupHandler(projectGroup.group_project_id)} style="text" circularCorners={false} icon="delete">
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button linkTo={`/admin/groups/edit/${projectGroup.group_id}`} style="secondary" circularCorners={false} icon="edit">
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
            </StyledRow>
          ))}
        </StyledList>
      );
    }

    return (
      <Container>
        {selectGroups}
        {noGroups}
        {groupsList}
      </Container>
    );
  }
}

export default injectIntl<Props>(ProjectGroupsList);
