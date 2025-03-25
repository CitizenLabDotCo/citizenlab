import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import { PARTICIPATION_METHOD_LABELS } from '../constants';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

type Option = {
  value: RansackParams['q[phases_participation_method_eq]'];
  label: string;
};

const Method = () => {
  const value = useRansackParam('q[phases_participation_method_eq]');
  const { formatMessage } = useIntl();

  const options = keys(PARTICIPATION_METHOD_LABELS).map((key) => ({
    value: key,
    label: formatMessage(PARTICIPATION_METHOD_LABELS[key]),
  }));

  return (
    <Select
      value={value}
      options={options}
      canBeEmpty
      onChange={(option: Option) => {
        setRansackParam('q[phases_participation_method_eq]', option.value);
        trackEventByName(tracks.setMethod, { method: option.value });
      }}
      placeholder={formatMessage(messages.method)}
    />
  );
};

export default Method;
