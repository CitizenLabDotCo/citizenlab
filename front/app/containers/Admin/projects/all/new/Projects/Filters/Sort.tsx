import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';

import { Parameters } from 'api/projects_mini_admin/types';

import { useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../utils';

import messages from './messages';

type Option = {
  value: Parameters['sort'];
  label: string;
};

const OPTIONS = [
  {
    value: 'phase_starting_or_ending_soon',
    message: messages.phase_starting_or_ending_soon,
  },
  { value: 'recently_viewed', message: messages.recently_viewed },
  { value: 'recently_created', message: messages.recently_created },
] as const;

const Sort = () => {
  const { formatMessage } = useIntl();
  const value = useParam('sort') ?? 'phase_starting_or_ending_soon';

  const options: Option[] = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <Box mr="12px">
      <Select
        value={value}
        options={options}
        onChange={(option) => {
          setParam('sort', option.value);
        }}
        mr="20px"
      />
    </Box>
  );
};

export default Sort;
