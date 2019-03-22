import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { updateIdea } from 'services/ideas';

import Select from 'components/UI/Select';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize from 'utils/localize';
import messages from './messages';

import { IOption } from 'typings';

import styled from 'styled-components';
import Label from 'components/UI/Label';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  statuses: GetIdeaStatusesChildProps;
  idea: GetIdeaChildProps;
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

interface IColoredOption extends IOption {
  color: string;
}

interface State {
  statusOptions: IOption[];
  assigneeOptions: IOption[];
  ideaStatusOption: IColoredOption | null;
  ideaAssigneeOption: string | null;
}

class IdeaSettings extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      statusOptions: [],
      assigneeOptions: [],
      ideaStatusOption: null,
      ideaAssigneeOption: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { statuses, localize, idea, prospectAssignees, intl: { formatMessage } } = nextProps;
    const nextState = prevState;

    if (statuses !== prevState.statuses) {
      if (isNilOrError(statuses)) {
        nextState.statusOptions = [];
      } else {
        nextState.statusOptions = statuses.map(status => ({ value: status.id, label: localize(status.attributes.title_multiloc) }));
      }
    }

    if (prospectAssignees !== prevState.prospectAssignees) {
      if (isNilOrError(prospectAssignees.usersList)) {
        nextState.assigneeOptions = [];
      } else {
        nextState.assigneeOptions = prospectAssignees.usersList.map(assignee => ({ value: assignee.id, label: `${assignee.attributes.first_name} ${assignee.attributes.last_name}` }));
        nextState.assigneeOptions.push({ value: 'unassigned', label: formatMessage(messages.noOne) });
      }
    }

    if (idea !== prevState.idea && !isNilOrError(statuses)) {
      if (isNilOrError(idea) || !idea.relationships.idea_status || !idea.relationships.idea_status.data) {
        nextState.ideaStatusOption = null;
      } else {
        const ideaStatus = statuses.find(status => status.id === idea.relationships.idea_status.data.id);
        nextState.ideaStatusOption = {
          value: ideaStatus.id,
          label: localize(ideaStatus.attributes.title_multiloc),
          color: ideaStatus.attributes.color
        };
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

  onStatusChange = (statusOption: IOption) => {
    updateIdea(this.props.ideaId, {
      idea_status_id: statusOption.value
    });
  }

  onAssigneeChange = (assigneeOption: IOption | null) => {
    updateIdea(this.props.ideaId, {
      assignee_id: assigneeOption ? assigneeOption.value : null
    });
  }

  render() {
    const { idea, className } = this.props;
    const { statusOptions, assigneeOptions, ideaStatusOption, ideaAssigneeOption } = this.state;

    if (!isNilOrError(idea)) {
      return (
        <Container className={`${className} e2e-idea-settings`}>

          <StyledLabel value={<FormattedMessage {...messages.ideaStatus}/>} htmlFor="idea-preview-select-status"/>
          <Select
            inputId="idea-preview-select-status"
            options={statusOptions}
            onChange={this.onStatusChange}
            value={ideaStatusOption}
            clearable={false}
            borderColor={ideaStatusOption ? ideaStatusOption.color : undefined}
          />
          <StyledLabel value={<FormattedMessage {...messages.assignee}/>} htmlFor="idea-preview-select-assignee"/>
          <Select
            inputId="idea-preview-select-assignee"
            options={assigneeOptions}
            onChange={this.onAssigneeChange}
            clearable={false}
            value={ideaAssigneeOption}
          />
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  statuses: <GetIdeaStatuses/>,
  prospectAssignees: ({ idea, render }) => !isNilOrError(idea) ? <GetUsers canModerateProject={idea.relationships.project.data.id}>{render}</GetUsers> : null
});

const IdeaSettingsWithHOCs = injectIntl(injectLocalize(IdeaSettings));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaSettingsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
