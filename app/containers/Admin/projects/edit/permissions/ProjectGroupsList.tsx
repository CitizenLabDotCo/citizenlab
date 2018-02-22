// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';
import MultipleSelect from 'components/UI/MultipleSelect';
import GroupAvatar from 'containers/Admin/groups/all/GroupAvatar';
import { List, Row } from 'components/admin/ResourceList';

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { listGroups, IGroups, IGroupData } from 'services/groups';
import { addGroupProject, deleteGroupProject, groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

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

const GroupTitle = styled.div``;

const GroupMembershipCount = styled.div``;

interface IProjectGroup {
  group_id: string;
  group_project_id: string;
  title: string;
  membership_count: number;
}

interface Props {
  projectId: string;
}

interface State {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  groupsOptions: IOption[] | null;
  projectGroups: IProjectGroup[] | null;
  selectedGroups: IOption[] | null;
  loading: boolean;
}

class ProjectGroupsList extends React.PureComponent<Props & InjectedIntlProps, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      groupsOptions: null,
      projectGroups: null,
      selectedGroups: null,
      loading: true
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const groups$ = listGroups().observable;
    const groupsProjects$ = groupsProjectsByProjectIdStream(projectId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        groups$,
        groupsProjects$
      ).subscribe(([locale, currentTenant, groups, groupsProjects]) => {
        const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
        const projectGroups = _(groupsProjects.data).map((groupProject) => {
          const group = _(groups.data).find(group => group.id === groupProject.relationships.group.data.id) as IGroupData;

          return {
            group_id: group.id,
            group_project_id: groupProject.id,
            title: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales),
            membership_count: group.attributes.memberships_count
          };
        }).reverse().value();
        const groupsOptions = this.getOptions(groups, groupsProjects, locale, currentTenantLocales);
        const loading = false;

        this.setState({
          locale,
          currentTenantLocales,
          projectGroups,
          groupsOptions,
          loading
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

  getOptions = (groups: IGroups | null, groupsProjects: IGroupsProjects, locale: Locale, currentTenantLocales: Locale[]) => {
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
    const { groupsOptions, projectGroups, selectedGroups, loading } = this.state;
    const groupsMultipleSelectPlaceholder = formatMessage(messages.groupsMultipleSelectPlaceholder);

    const noGroups = ((!loading && (!projectGroups || projectGroups.length === 0)) ? (
      <Warning text={<FormattedMessage {...messages.noSelectedGroupsMessage} />} />
    ) : null);

    const selectGroups = (!loading ? (
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

    const groupsList = ((!loading && projectGroups && projectGroups.length > 0) ? (
      <List>
        {projectGroups.map((projectGroup) => (
          <Row key={projectGroup.group_project_id}>
            <GroupAvatar groupId={projectGroup.group_id} />
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
          </Row>
        ))}
      </List>
    ) : null);

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
