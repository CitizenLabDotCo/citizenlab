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

interface DataProps {
  prospectAssignees: GetUsersChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  assignee: string;
  handleAssigneeFilterChange: (value: string) => void;
  projectId: string | undefined;
}

interface Props extends InputProps, DataProps {}

interface State {
  assigneeOptions: IOption[];
}

export class AssigneeFilter extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prospectAssignees, authUser, intl: { formatMessage } } = nextProps;
    const nextState = { ...prevState };

    if (prospectAssignees !== prevState.prospectAssignees || authUser !== prevState.authUser) {
      if (isNilOrError(prospectAssignees.usersList) || isNilOrError(authUser)) {
        nextState.assigneeOptions = [];
      } else {
        const assigneeOptionsWithoutCurrentUser = prospectAssignees.usersList.filter(assignee => assignee.id !== authUser.id)
          .map(assignee => ({
            value: assignee.id,
            text: formatMessage(messages.assignedTo, {
              assigneeName:  `${assignee.attributes.first_name} ${assignee.attributes.last_name}`
            })
          }));

        // Order of assignee filter options:
        // All ideas > Assigned to me > Unassigned > Assigned to X (other admins/mods)
        nextState.assigneeOptions = assigneeOptionsWithoutCurrentUser;
        nextState.assigneeOptions.unshift({ value: 'unassigned', text: formatMessage(messages.unassignedIdeas), id: 'e2e-assignee-filter-unassigned' });
        nextState.assigneeOptions.unshift({ value: authUser.id, text: formatMessage(messages.assignedToMe), id: 'e2e-assignee-filter-assigned-to-user' });
        nextState.assigneeOptions.unshift({ value: 'all', text: formatMessage(messages.anyAssignment), id: 'e2e-assignee-filter-all-ideas' });
      }
    }
    return nextState;
  }

  onAssigneeChange = (_event, assigneeOption) => {
    this.props.handleAssigneeFilterChange(assigneeOption.value);
  }

  render() {
    const { assignee } = this.props;
    const { assigneeOptions } = this.state;

    return (
      <Dropdown
        id="e2e-idea-select-assignee-filter"
        options={assigneeOptions}
        onChange={this.onAssigneeChange}
        value={assignee}
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
