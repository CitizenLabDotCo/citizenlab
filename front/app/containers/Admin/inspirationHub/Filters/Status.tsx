import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[status_eq]'];
  label: string;
};

const OPTIONS_UNTRANSLATED = [
  { value: 'active', labelMessage: messages.active },
  { value: 'archived', labelMessage: messages.archived },
  { value: 'draft', labelMessage: messages.draft },
  { value: 'finished', labelMessage: messages.finished },
  { value: 'stale', labelMessage: messages.stale },
];

const Status = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam('q[status_eq]');

  const options = OPTIONS_UNTRANSLATED.map(({ value, labelMessage }) => ({
    value,
    label: formatMessage(labelMessage),
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
