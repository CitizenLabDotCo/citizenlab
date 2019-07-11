import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { Select } from 'semantic-ui-react';
import { IOption } from 'typings';

// services
import { updateIdea } from 'services/ideas';
import { updateInitiative } from 'services/initiatives';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetInitiativeChildProps } from 'resources/GetInitiative';

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
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  type: 'AllIdeas' | 'ProjectIdeas' | 'Initiatives';
  post: GetIdeaChildProps | GetInitiativeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  assigneeOptions: IOption[];
  postAssigneeOption: string | undefined;
  prevPropsProspectAssignees: GetUsersChildProps | null;
  prevPropsPost:  GetIdeaChildProps | GetInitiativeChildProps;
}

class AssigneeSelect extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      assigneeOptions: [],
      postAssigneeOption: undefined,
      prevPropsProspectAssignees: null,
      prevPropsPost: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { post, prospectAssignees, intl: { formatMessage } } = props;
    const { prevPropsProspectAssignees, prevPropsPost } = state;
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

    if (post !== prevPropsPost) {
      if (isNilOrError(post) || !post.relationships.assignee || !post.relationships.assignee.data) {
        nextState.postAssigneeOption = 'unassigned';
      } else {
        nextState.postAssigneeOption = post.relationships.assignee.data.id;
      }

      nextState.prevPropsPost = post;
    }

    return nextState;
  }

  onAssigneeChange = (_event, assigneeOption) => {
    const { post, type }  = this.props;
    const assigneeId = assigneeOption ? assigneeOption.value : null;

    if (!isNilOrError(post)) {
      if (type === 'Initiatives') {
        updateInitiative(post.id, {
          assignee_id: assigneeId
        });
      } else {
        updateIdea(post.id, {
          assignee_id: assigneeId
        });
      }
      trackEventByName(tracks.changePostAssignment, {
        type,
        location: 'Post manager',
        post: post.id,
        assignee: assigneeId,
      });
    }

  }

  render() {
    const { post } = this.props;
    const { assigneeOptions, postAssigneeOption } = this.state;

    if (!isNilOrError(post)) {
      return (
        <Select
          id={`post-row-select-assignee-${post.id}`}
          options={assigneeOptions}
          onChange={this.onAssigneeChange}
          value={postAssigneeOption}
          className="fluid e2e-post-manager-post-row-assignee-select"
        />
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ post, render }) => <GetUsers canModerateProject={get(post, 'relationships.project.data.id')}>{render}</GetUsers>
});

const AssigneeSelectWithHocs = injectIntl<Props>(AssigneeSelect);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeSelectWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
