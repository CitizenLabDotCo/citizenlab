import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import OptionPicker from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useProjectAssignee from './useProjectAssignee';

interface Props {
  projectId: string;
}

const AssigneeRow = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { loaded, options, assignee, setAssignee } =
    useProjectAssignee(projectId);

  if (!loaded) return null;

  const title = formatMessage(messages.assignee);
  const description = formatMessage(messages.assigneeDescription);

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      justifyContent="space-between"
      gap="12px"
    >
      <Box display="flex" flexDirection="column" gap="2px">
        <Text as="span" variant="boControl" m="0">
          {title}
        </Text>
        <Text as="span" variant="boHelper" m="0">
          {description}
        </Text>
      </Box>
      <OptionPicker
        title={title}
        description={description}
        options={options.map((option) => ({ ...option, icon: 'user' }))}
        value={assignee}
        onChange={setAssignee}
      />
    </Box>
  );
};

export default AssigneeRow;
