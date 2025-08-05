import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { Parameters } from 'api/projects_mini_admin/types';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

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
  { value: 'alphabetically_asc', message: messages.alphabetically_asc },
  { value: 'alphabetically_desc', message: messages.alphabetically_desc },
] as const;

const Sort = () => {
  const { formatMessage } = useIntl();
  const value = useParam('sort') ?? 'phase_starting_or_ending_soon';

  const options: Option[] = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <Select
      value={value}
      options={options}
      onChange={(option) => {
        setParam('sort', option.value);
        trackEventByName(tracks.setSort, { sort: option.value });
      }}
      mr="20px"
    />
  );
};

export default Sort;
