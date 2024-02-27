import React from 'react';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { GroupMode } from 'api/graph_data_units/requestTypes';

type Option = { value: GroupMode | ''; label: string };

interface Props {
  mode?: GroupMode;
  onChange: (mode?: GroupMode) => void;
}

const GroupModeSelect = ({ mode, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const handleChange = ({ value }: Option) => {
    onChange(value === '' ? undefined : (value as GroupMode));
  };

  const options: Option[] = [
    { value: '', label: formatMessage(messages.none) },
    { value: 'user_field', label: formatMessage(messages.userField) },
    { value: 'survey_question', label: formatMessage(messages.surveyQuestion) },
  ];

  return (
    <Box width="100%" mb="20px">
      <Select
        id="e2e-group-mode-select"
        label={formatMessage(messages.groupMode)}
        value={mode ?? ''}
        options={options}
        onChange={handleChange}
      />
    </Box>
  );
};

export default GroupModeSelect;
