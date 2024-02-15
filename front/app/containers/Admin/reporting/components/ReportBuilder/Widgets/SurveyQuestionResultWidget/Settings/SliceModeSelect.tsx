import React from 'react';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { SliceMode } from 'api/graph_data_units/requestTypes';

type Option = { value: SliceMode | ''; label: string };

interface Props {
  mode?: SliceMode;
  onChange: (mode?: SliceMode) => void;
}

const SliceModeSelect = ({ mode, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const handleChange = ({ value }: Option) => {
    onChange(value === '' ? undefined : (value as SliceMode));
  };

  const options: Option[] = [
    { value: '', label: formatMessage(messages.none) },
    { value: 'user_field', label: formatMessage(messages.userField) },
    { value: 'survey_question', label: formatMessage(messages.surveyQuestion) },
  ];

  return (
    <Box width="100%" mb="20px">
      <Select
        label={formatMessage(messages.sliceMode)}
        value={mode ?? ''}
        options={options}
        onChange={handleChange}
      />
    </Box>
  );
};

export default SliceModeSelect;
