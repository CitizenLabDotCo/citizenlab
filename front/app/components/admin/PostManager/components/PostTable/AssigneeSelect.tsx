import React from 'react';

import { colors, IOption, Select } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';
import useAssigneeOptions, { UNASSIGNED } from '../../useAssigneeOptions';

const StyledSelect = styled(Select)`
  width: 160px;

  // Semantic UI Select component was replaced here which changed the UI, but I wanted to
  // maintain similar styles to what we had before so it looks visually consistent.
  select {
    padding-right: 36px;
    padding-top: 4px;
    padding-bottom: 4px;
    border: solid 1px ${colors.grey300};
    color: ${colors.primary};
    font-size: 14px;
  }
`;
interface Props {
  projectId?: string;
  assigneeId: string | undefined;
  onAssigneeChange: (assigneeId: string | undefined) => void;
}

const AssigneeSelect = ({ projectId, assigneeId, onAssigneeChange }: Props) => {
  const { formatMessage } = useIntl();
  const options = useAssigneeOptions(projectId, (assignee) =>
    formatMessage(messages.assignedTo, {
      assigneeName: getFullName(assignee),
    })
  );

  if (options.length === 0) return null;

  const handleOnAssigneeChange = (option: IOption) => {
    if (typeof option.value === 'string') {
      onAssigneeChange(option.value === UNASSIGNED ? undefined : option.value);
    }
  };

  return (
    <StyledSelect
      id={'post-row-select-assignee'}
      options={options}
      onChange={handleOnAssigneeChange}
      value={assigneeId || UNASSIGNED}
      className="fluid e2e-post-manager-post-row-assignee-select"
    />
  );
};

export default AssigneeSelect;
