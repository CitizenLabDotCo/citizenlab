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

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { listGroups, IGroups } from 'services/groups';
import { addGroupProject, groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

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
  flex-direction: row;
`;

// Typing
interface Props {
  projectId: string;
}

interface State {
  locale: string | null;
  currentTenant: ITenant | null;
  groups: IOption[] | null;
  groupsProjects: IGroupsProjects | null;
  selectedGroups: IOption[] | null;
  loading: boolean;
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
      groupsProjects: null,
      selectedGroups: null,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
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
        console.log('groups:');
        console.log(groups);
        console.log('groupsProjects:');
        console.log(groupsProjects);
        console.log('groups:');
        console.log(this.getOptions(groups, locale, currentTenant.data.attributes.settings.core.locales));

        this.setState({ 
          locale,
          currentTenant,
          groupsProjects,
          groups: this.getOptions(groups, locale, currentTenant.data.attributes.settings.core.locales),
          loading: false });
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
      } catch (error) {
        console.log(error);
      }
    }
  }

  getOptions = (groups: IGroups | null, locale: string, currentTenantLocales: string[]) => {
    if (groups && groups.data && groups.data.length > 0) {
      const options: IOption[] = groups.data.map((group) => ({
        value: group.id,
        label: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales)
      }));

      return options;
    }

    return null;
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { locale, currentTenant, groups, groupsProjects, selectedGroups } = this.state;
    const groupsMultipleSelectPlaceholder = formatMessage(messages.groupsMultipleSelectPlaceholder);

    const noGroups = (!groupsProjects ? (
      <EmptyStateMessage>
        <StyledIcon name="warning" />
        <FormattedHTMLMessage {...messages.noSelectedGroupsMessage} />
      </EmptyStateMessage>
    ) : null);

    const selectGroups = ((!!locale && !!currentTenant) ? (
      <SelectGroupsContainer>
        <MultipleSelect
          options={groups}
          value={selectedGroups}
          onChange={this.handleGroupsOnChange}
          placeholder={groupsMultipleSelectPlaceholder}
        />

        <Button
          text={formatMessage(messages.addGroup)}
          style="cl-blue"
          size="2"
          icon="plus-circle"
          onClick={this.handleOnAddGroupClick}
          circularCorners={false}
        />
      </SelectGroupsContainer>
    ) : null);

    const groupsList = (groupsProjects ? (
      <span>GroupsList</span>
    ) : null);

    return (
      <Container>
        {noGroups}
        {selectGroups}
        {groupsList}
      </Container>
    );
  }
}

export default injectIntl<Props>(ProjectGroupsList);
