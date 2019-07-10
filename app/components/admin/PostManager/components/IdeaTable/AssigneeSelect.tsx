import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { Select } from 'semantic-ui-react';
import { IOption } from 'typings';

// services
import { updateIdea } from 'services/ideas';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
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
  prevPropsProspectAssignees: GetUsersChildProps | null;
  prevPropsIdea: GetIdeaChildProps;
}

class AssigneeSelect extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
      ideaAssigneeOption: undefined,
      prevPropsProspectAssignees: null,
      prevPropsIdea: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { idea, prospectAssignees, intl: { formatMessage } } = props;
    const { prevPropsProspectAssignees, prevPropsIdea } = state;
    const nextState = { ...state };

    if (prospectAssignees !== prevPropsProspectAssignees) {
      if (isNilOrError(prospectAssignees.usersList)) {
        nextState.assigneeOptions = [];
      } else {
        nextState.assigneeOptions = prospectAssignees.usersList.map(assignee => ({ value: assignee.id, text: `${assignee.attributes.first_name} ${assignee.attributes.last_name}` }));
        nextState.assigneeOptions.push({ value: 'unassigned', text: formatMessage(messages.noOne) });
      }

      nextState.prevPropsProspectAssignees = prospectAssignees;
    }

    if (idea !== prevPropsIdea) {
      if (isNilOrError(idea) || !idea.relationships.assignee || !idea.relationships.assignee.data) {
        nextState.ideaAssigneeOption = 'unassigned';
      } else {
        nextState.ideaAssigneeOption = idea.relationships.assignee.data.id;
      }

      nextState.prevPropsIdea = idea;
    }

    return nextState;
  }

  onAssigneeChange = (_event, assigneeOption) => {
    const { tenant, ideaId, authUser }  = this.props;
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(ideaId, {
      assignee_id: assigneeId
    });

    trackEventByName(tracks.ideaReviewAssignment, {
      tenant: tenantId,
      location: 'Idea overview',
      idea: ideaId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId
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
          className="fluid e2e-idea-manager-idea-row-assignee-select"
        />
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  prospectAssignees: ({ idea, render }) => <GetUsers canModerateProject={get(idea, 'relationships.project.data.id')}>{render}</GetUsers>
});

const AssigneeSelectWithHocs = injectIntl<Props>(AssigneeSelect);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeSelectWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
