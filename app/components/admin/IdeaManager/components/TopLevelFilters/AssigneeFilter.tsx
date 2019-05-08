import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';

// import Select from 'components/UI/Select';
import { Dropdown } from 'semantic-ui-react';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

import { IOption } from 'typings';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

interface DataProps {
  prospectAssignees: GetUsersChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  handleAssigneeFilterChange: (value: string) => void;
  projectId: string | undefined;
  assignee: string | undefined;
}

interface Props extends InputProps, DataProps {}

interface State {
  assigneeOptions: IOption[];
  prevPropsProspectAssignees: GetUsersChildProps | null;
  prevPropsAuthUser: GetAuthUserChildProps;
}

export class AssigneeFilter extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
      prevPropsProspectAssignees: null,
      prevPropsAuthUser: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { prospectAssignees, authUser, intl: { formatMessage }, handleAssigneeFilterChange } = props;
    const { prevPropsProspectAssignees, prevPropsAuthUser } = state;

    if (authUser !== prevPropsAuthUser && !isNilOrError(authUser)) {
      handleAssigneeFilterChange(authUser.id);
    }

    if (prospectAssignees !== prevPropsProspectAssignees || authUser !== prevPropsAuthUser) {
      let assigneeOptions;

      if (isNilOrError(prospectAssignees.usersList) || isNilOrError(authUser)) {
        assigneeOptions = [];
      } else {
        const assigneeOptionsWithoutCurrentUser = prospectAssignees.usersList.filter(assignee => assignee.id !== authUser.id)
          .map(assignee => ({
            value: assignee.id,
            text: formatMessage(messages.assignedTo, {
              assigneeName:  `${assignee.attributes.first_name} ${assignee.attributes.last_name}`
            }),
            className: 'e2e-assignee-filter-other-user'
          }));

        // Order of assignee filter options:
        // All ideas > Assigned to me > Unassigned > Assigned to X (other admins/mods)
        assigneeOptions = assigneeOptionsWithoutCurrentUser;
        assigneeOptions.unshift({ value: 'unassigned', text: formatMessage(messages.unassignedIdeas), id: 'e2e-assignee-filter-unassigned' });
        assigneeOptions.unshift({ value: authUser.id, text: formatMessage(messages.assignedToMe), id: 'e2e-assignee-filter-assigned-to-user' });
        assigneeOptions.unshift({ value: 'all', text: formatMessage(messages.anyAssignment), id: 'e2e-assignee-filter-all-ideas' });
      }

      return { assigneeOptions, prevPropsAuthUser: authUser, prevPropsProspectAssignees: prospectAssignees };
    }

    return null;
  }

  onAssigneeChange = (_event, assigneeOption) => {
    const realFiterParam = assigneeOption.value === 'all' ? undefined : assigneeOption.value;
    trackEventByName(tracks.assigneeFilterUsed, {
      assignee: realFiterParam,
      adminAtWork: this.props.authUser && this.props.authUser.id
    });
    this.props.handleAssigneeFilterChange(realFiterParam);
  }

  render() {
    const { assigneeOptions } = this.state;
    const { assignee } = this.props;

    return (
      <Dropdown
        id="e2e-idea-select-assignee-filter"
        options={assigneeOptions}
        onChange={this.onAssigneeChange}
        value={assignee || 'all'}
        search
        selection
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ projectId, render }) => projectId
    ? <GetUsers canModerateProject={projectId} pageSize={250}>{render}</GetUsers>
    : <GetUsers canModerate pageSize={250}>{render}</GetUsers>,
  authUser: <GetAuthUser />
});

const AssigneeFilterWithHocs = injectIntl<Props>(AssigneeFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeFilterWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
