import React from 'react';
import { adopt } from 'react-adopt';
import { isString } from 'lodash-es';
import styled from 'styled-components';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

// components
import { Select } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import useUpdateProject from 'api/projects/useUpdateProject';
import useProjectById from 'api/projects/useProjectById';

const StyledSelect = styled(Select)`
  width: 300px;
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  adminsAndMods: GetUsersChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaAssignment = ({ adminsAndMods, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  const getOptions = () => {
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
        label: formatMessage(messages.unassigned),
      },
      ...projectAssigneeOptions,
    ];
  };

  const onAssigneeChange = (assigneeOption: IOption) => {
    // convert 'unassigned' to null for the back-end update
    const defaultAssigneeId =
      assigneeOption.value !== 'unassigned' ? assigneeOption.value : null;

    updateProject({
      projectId,
      default_assignee_id: defaultAssigneeId,
    });
  };

  if (project) {
    const defaultAssigneeId =
      project.data.relationships?.default_assignee?.data?.id;
    // If defaultAssigneeValue is not a string, it's null, so we convert it to a string (see getoptions)
    const defaultAssigneeValue = isString(defaultAssigneeId)
      ? defaultAssigneeId
      : 'unassigned';

    return (
      <StyledSelect
        options={getOptions()}
        value={defaultAssigneeValue}
        onChange={onAssigneeChange}
      />
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  adminsAndMods: ({ projectId, render }) => (
    <GetUsers canModerateProject={projectId}>{render}</GetUsers>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <IdeaAssignment {...inputProps} {...dataprops} />}
  </Data>
);
