import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { memoize } from 'lodash-es';

import { isNilOrError } from 'utils/helperUtils';

// import { Select } from 'cl2-component-library';
import { Dropdown } from 'semantic-ui-react';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { ManagerType } from '../..';

interface DataProps {
  prospectAssignees: GetUsersChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  handleAssigneeFilterChange: (value: string) => void;
  projectId?: string | null;
  assignee?: string | null;
  type: ManagerType;
  className?: string;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class AssigneeFilter extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  getAssigneeOptions = memoize((prospectAssignees, authUser) => {
    const {
      intl: { formatMessage },
    } = this.props;
    let assigneeOptions = [] as {
      value: string;
      text: string;
      id?: string;
      className?: string;
    }[];

    if (!isNilOrError(prospectAssignees.usersList) && !isNilOrError(authUser)) {
      const dynamicOptions = prospectAssignees.usersList
        .filter((assignee) => assignee.id !== authUser.id)
        .map((assignee) => ({
          value: assignee.id,
          text: formatMessage(messages.assignedTo, {
            assigneeName: `${assignee.attributes.first_name} ${assignee.attributes.last_name}`,
          }),
          className: 'e2e-assignee-filter-other-user',
        }));

      // Order of assignee filter options:
      // All ideas > Assigned to me > Unassigned > Assigned to X (other admins/mods)
      assigneeOptions = [
        {
          value: 'all',
          text: formatMessage(messages.anyAssignment),
          id: 'e2e-assignee-filter-all-posts',
        },
        {
          value: authUser.id,
          text: formatMessage(messages.assignedToMe),
          id: 'e2e-assignee-filter-assigned-to-user',
        },
        {
          value: 'unassigned',
          text: formatMessage(messages.noOne),
          id: 'e2e-assignee-filter-unassigned',
        },
        ...dynamicOptions,
      ];
    }
    return assigneeOptions;
  });

  onAssigneeChange = (_event, assigneeOption) => {
    const realFiterParam =
      assigneeOption.value === 'all' ? undefined : assigneeOption.value;
    trackEventByName(tracks.assigneeFilterUsed, {
      assignee: realFiterParam,
      adminAtWork: this.props.authUser && this.props.authUser.id,
    });
    this.props.handleAssigneeFilterChange(realFiterParam);
  };

  render() {
    const { assignee, prospectAssignees, authUser, className } = this.props;

    return (
      <Dropdown
        className={className}
        id="e2e-select-assignee-filter"
        options={this.getAssigneeOptions(prospectAssignees, authUser)}
        onChange={this.onAssigneeChange}
        value={assignee || 'all'}
        search
        selection
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ type, projectId, render }) =>
    type === 'ProjectIdeas' && projectId ? (
      <GetUsers canModerateProject={projectId} pageSize={250}>
        {render}
      </GetUsers>
    ) : type === 'AllIdeas' ? (
      <GetUsers canModerate pageSize={250}>
        {render}
      </GetUsers>
    ) : (
      <GetUsers canAdmin pageSize={250}>
        {render}
      </GetUsers>
    ),
  authUser: <GetAuthUser />,
});

const AssigneeFilterWithHocs = injectIntl<Props>(AssigneeFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AssigneeFilterWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
