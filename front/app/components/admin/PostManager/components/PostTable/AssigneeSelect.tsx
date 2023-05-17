import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Select } from 'semantic-ui-react';
import { memoize } from 'lodash-es';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  prospectAssignees: GetUsersChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  projectId?: string;
  assigneeId: string | undefined;
  onAssigneeChange: (assigneeId: string | undefined) => void;
}

interface Props extends InputProps, DataProps {}

class AssigneeSelect extends PureComponent<Props & WrappedComponentProps> {
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
      // Assigned to me > Unassigned > Assigned to X (other admins/mods)
      assigneeOptions = [
        {
          value: authUser.id,
          text: formatMessage(messages.assignedToMe),
          id: 'e2e-assignee-select-assigned-to-user',
        },
        {
          value: 'unassigned',
          text: formatMessage(messages.noOne),
          id: 'e2e-assignee-select-unassigned',
        },
        ...dynamicOptions,
      ];
    }
    return assigneeOptions;
  });

  onAssigneeChange = (_event, { value }: { value?: unknown }) => {
    const { onAssigneeChange } = this.props;

    if (typeof value === 'string') {
      onAssigneeChange(value === 'unassigned' ? undefined : value);
    }
  };

  render() {
    const { assigneeId, prospectAssignees, authUser } = this.props;

    return (
      <Select
        id={'post-row-select-assignee'}
        options={this.getAssigneeOptions(prospectAssignees, authUser)}
        onChange={this.onAssigneeChange}
        value={assigneeId || 'unassigned'}
        className="fluid e2e-post-manager-post-row-assignee-select"
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  prospectAssignees: ({ projectId, render }) =>
    projectId ? (
      <GetUsers can_moderate_project={projectId}>{render}</GetUsers>
    ) : (
      <GetUsers can_admin>{render}</GetUsers>
    ),
});

const AssigneeSelectWithHocs = injectIntl(AssigneeSelect);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AssigneeSelectWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
