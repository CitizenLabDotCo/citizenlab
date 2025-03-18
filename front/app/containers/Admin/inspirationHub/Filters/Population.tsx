import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import { POPULATION_GROUP_LABELS } from '../constants';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[tenant_population_group_eq]'];
  label: string;
};

const OPTIONS: Option[] = keys(POPULATION_GROUP_LABELS).map((key) => ({
  value: key,
  label: POPULATION_GROUP_LABELS[key],
}));

const Population = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam('q[tenant_population_group_eq]');

  return (
    <Select
      value={value}
      options={OPTIONS}
      canBeEmpty
      onChange={(option: Option) =>
        setRansackParam('q[tenant_population_group_eq]', option.value)
      }
      placeholder={formatMessage(messages.population)}
      mr="28px"
    />
  );
};

export default Population;
