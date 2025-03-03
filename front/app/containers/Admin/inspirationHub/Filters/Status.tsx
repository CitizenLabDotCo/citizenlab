import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import { STATUS_LABELS } from '../constants';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[status_eq]'];
  label: string;
};

const Status = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam('q[status_eq]');

  const options = keys(STATUS_LABELS).map((key) => ({
    value: key,
    label: formatMessage(STATUS_LABELS[key]),
  }));

  return (
    <Select
      value={value}
      options={options}
      canBeEmpty
      onChange={(option: Option) =>
        setRansackParam('q[status_eq]', option.value)
      }
      placeholder={formatMessage(messages.status)}
      mr="28px"
    />
  );
};

export default Status;
