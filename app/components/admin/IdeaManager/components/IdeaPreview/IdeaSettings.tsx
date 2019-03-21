import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { updateIdea } from 'services/ideas';

import Select from 'components/UI/Select';

import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize from 'utils/localize';
import messages from './messages';

import { IOption } from 'typings';

import styled from 'styled-components';
import Label from 'components/UI/Label';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  statuses: GetIdeaStatusesChildProps;
  idea: GetIdeaChildProps;
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
}

class IdeaSettings extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      statusOptions: [],
      assigneeOptions: [],
      ideaStatusOption: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { statuses, localize, idea } = nextProps;
    const nextState = prevState;
    if (statuses !== prevState.statuses) {
      if (isNilOrError(statuses)) {
        nextState.statusOptions = [];
      } else {
        nextState.statusOptions = statuses.map(status => ({ value: status.id, label: localize(status.attributes.title_multiloc) }));
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

    return nextState;
  }

  onStatusChange = (statusOption: IOption) => {
    updateIdea(this.props.ideaId, {
      idea_status_id: statusOption.value
    });
  }

  onAssigneeChange = () => {

  }

  render() {
    const { idea, className } = this.props;
    const { statusOptions, assigneeOptions, ideaStatusOption } = this.state;

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
});

const IdeaSettingsWithHOCs = injectLocalize(IdeaSettings);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaSettingsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
