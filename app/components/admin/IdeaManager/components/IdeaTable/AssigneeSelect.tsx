import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { updateIdea } from 'services/ideas';

// import Select from 'components/UI/Select';
import { Select } from 'semantic-ui-react';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

import { IOption } from 'typings';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

interface DataProps {
  idea: GetIdeaChildProps;
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  ideaId: string;
}

interface Props extends InputProps, DataProps {}

interface State {
  assigneeOptions: IOption[];
  ideaAssigneeOption: string | undefined;
}

class AssigneeSelect extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
      ideaAssigneeOption: undefined
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { idea, prospectAssignees, intl: { formatMessage } } = nextProps;
    const nextState = prevState;

    if (prospectAssignees !== prevState.prospectAssignees) {
      if (isNilOrError(prospectAssignees.usersList)) {
        nextState.assigneeOptions = [];
      } else {
        nextState.assigneeOptions = prospectAssignees.usersList.map(assignee => ({ value: assignee.id, text: `${assignee.attributes.first_name} ${assignee.attributes.last_name}` }));
        nextState.assigneeOptions.push({ value: 'unassigned', text: formatMessage(messages.noOne) });
      }
    }

    if (idea !== prevState.idea) {
      if (isNilOrError(idea) || !idea.relationships.assignee || !idea.relationships.assignee.data) {
        nextState.ideaAssigneeOption = 'unassigned';
      } else {
        nextState.ideaAssigneeOption = idea.relationships.assignee.data.id;
      }
    }

    return nextState;
  }

  onAssigneeChange = (_event, assigneeOption) => {
    updateIdea(this.props.ideaId, {
      assignee_id: assigneeOption ? assigneeOption.value : null
    });
  }

  render() {
    const { idea } = this.props;
    const { assigneeOptions, ideaAssigneeOption } = this.state;

    if (!isNilOrError(idea)) {
      return (
        <Select
          id={`idea-row-select-assignee-${idea.id}`}
          options={assigneeOptions}
          onChange={this.onAssigneeChange}
          value={ideaAssigneeOption}
          className="fluid"
        />
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  prospectAssignees: ({ idea, render }) => !isNilOrError(idea) ? <GetUsers canModerateProject={idea.relationships.project.data.id}>{render}</GetUsers> : null
});

const AssigneeSelectWithHocs = injectIntl<Props>(AssigneeSelect);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeSelectWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
