import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';

// import Select from 'components/UI/Select';
import { Select } from 'semantic-ui-react';

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
}

interface Props extends InputProps, DataProps {}

interface State {
  assigneeOptions: IOption[];
}

class AssigneeFilter extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prospectAssignees, authUser, intl: { formatMessage } } = nextProps;
    const nextState = prevState;

    if (prospectAssignees !== prevState.prospectAssignees || authUser !== prevState.authUser) {
      if (isNilOrError(prospectAssignees.usersList) || isNilOrError(authUser)) {
        nextState.assigneeOptions = [];
      } else {
        nextState.assigneeOptions = prospectAssignees.usersList.map(assignee => ({
          value: assignee.id,
          text: assignee.id === authUser.id
            ? formatMessage(messages.assignedToMe)
            : formatMessage(messages.assignedTo, {
                assigneeName:  `${assignee.attributes.first_name} ${assignee.attributes.last_name}`
              })
        }));
        nextState.assigneeOptions.unshift({ value: 'all', text: formatMessage(messages.anyAssignment) });
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
      <Select
        id="idea-select-assignee-filter"
        options={assigneeOptions}
        onChange={this.onAssigneeChange}
        value={assignee}
        className="fluid"
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: <GetUsers canModerate pageSize={50} />,
  authUser: <GetAuthUser />
});

const AssigneeFilterWithHocs = injectIntl<Props>(AssigneeFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeFilterWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
