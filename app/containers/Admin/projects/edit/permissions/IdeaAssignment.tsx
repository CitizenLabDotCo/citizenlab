import React from 'react';
import { adopt } from 'react-adopt';
import { isString, get } from 'lodash-es';
import styled from 'styled-components';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

// services
import { updateProject } from 'services/projects';

// components
import { Select } from 'cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const StyledSelect = styled(Select)`
  width: 300px;
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  adminsAndMods: GetUsersChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaAssignment extends React.PureComponent<Props & InjectedIntlProps> {
  getOptions = () => {
    const { adminsAndMods } = this.props;
    const prospectAssignees = adminsAndMods.usersList;
    let projectAssigneeOptions: IOption[] = [];

    if (!isNilOrError(prospectAssignees)) {
      projectAssigneeOptions = prospectAssignees.map((prospectAssignee) => {
        return {
          value: prospectAssignee.id,
          label: `${prospectAssignee.attributes.first_name} ${prospectAssignee.attributes.last_name}`,
        };
      });
    }

    return [
      {
        value: 'unassigned',
        label: this.props.intl.formatMessage(messages.unassigned),
      },
      ...projectAssigneeOptions,
    ];
  };

  onAssigneeChange = (assigneeOption: IOption) => {
    const { projectId } = this.props;
    // convert 'unassigned' to null for the back-end update
    const defaultAssigneeId =
      assigneeOption.value !== 'unassigned' ? assigneeOption.value : null;

    updateProject(projectId, {
      default_assignee_id: defaultAssigneeId,
    });
  };

  render() {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      const defaultAssigneeId = get(
        project,
        'relationships.default_assignee.data.id'
      );
      // If defaultAssigneeValue is not a string, it's null, so we convert it to a string (see this.getoptions)
      const defaultAssigneeValue = isString(defaultAssigneeId)
        ? defaultAssigneeId
        : 'unassigned';

      return (
        <StyledSelect
          options={this.getOptions()}
          value={defaultAssigneeValue}
          onChange={this.onAssigneeChange}
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  adminsAndMods: ({ projectId, render }) => (
    <GetUsers canModerateProject={projectId}>{render}</GetUsers>
  ),
});

const IdeaAssignmentWithInjectIntl = injectIntl(IdeaAssignment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => (
      <IdeaAssignmentWithInjectIntl {...inputProps} {...dataprops} />
    )}
  </Data>
);
