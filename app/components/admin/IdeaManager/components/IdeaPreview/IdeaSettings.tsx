import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize from 'utils/localize';
import messages from './messages';

// typings
import { IOption } from 'typings';

// styles
import styled from 'styled-components';

// components
import Label from 'components/UI/Label';
import Select from 'components/UI/Select';

// services
import { updateIdea } from 'services/ideas';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { GetIdeasChildProps } from 'resources/GetIdeas';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
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
  prevPropsStatuses: GetIdeasChildProps | null;
  prevPropsProspectAssignees: GetUsersChildProps | null;
  prevPropsIdea: GetIdeaChildProps;
}

class IdeaSettings extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      statusOptions: [],
      assigneeOptions: [],
      ideaStatusOption: null,
      ideaAssigneeOption: null,
      prevPropsStatuses: null,
      prevPropsProspectAssignees: null,
      prevPropsIdea: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { statuses, localize, idea, prospectAssignees, intl: { formatMessage } } = props;
    const { prevPropsStatuses, prevPropsProspectAssignees, prevPropsIdea } = state;
    const nextState = { ...state };

    if (statuses !== prevPropsStatuses) {
      if (isNilOrError(statuses)) {
        nextState.statusOptions = [];
      } else {
        nextState.statusOptions = statuses.map(status => ({ value: status.id, label: localize(status.attributes.title_multiloc) }));
      }

      nextState.prevPropsStatuses = statuses;
    }

    if (prospectAssignees !== prevPropsProspectAssignees) {
      if (isNilOrError(prospectAssignees.usersList)) {
        nextState.assigneeOptions = [];
      } else {
        nextState.assigneeOptions = prospectAssignees.usersList.map(assignee => ({ value: assignee.id, label: `${assignee.attributes.first_name} ${assignee.attributes.last_name}` }));
        nextState.assigneeOptions.push({ value: 'unassigned', label: formatMessage(messages.noOne) });
      }

      nextState.prevPropsProspectAssignees = prospectAssignees;
    }

    if (idea !== prevPropsIdea && !isNilOrError(statuses)) {
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

      nextState.prevPropsIdea = idea;
    }

    if (idea !== prevPropsIdea) {
      if (isNilOrError(idea) || !idea.relationships.assignee || !idea.relationships.assignee.data) {
        nextState.ideaAssigneeOption = 'unassigned';
      } else {
        nextState.ideaAssigneeOption = idea.relationships.assignee.data.id;
      }
    }

    return nextState;
  }

  onStatusChange = (statusOption: IOption) => {
    const { tenant, ideaId, authUser }  = this.props;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(this.props.ideaId, {
      idea_status_id: statusOption.value
    });

    trackEventByName(tracks.ideaStatusChange, {
      tenant: tenantId,
      location: 'Idea preview/popup',
      idea: ideaId,
      adminAtWork: adminAtWorkId
    });
  }

  onAssigneeChange = (assigneeOption: IOption | null) => {
    const { tenant, ideaId, authUser }  = this.props;
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(ideaId, {
      assignee_id: assigneeId
    });

    trackEventByName(tracks.ideaReviewAssignment, {
      tenant: tenantId,
      location: 'Idea preview/popup',
      idea: ideaId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId
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
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
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
