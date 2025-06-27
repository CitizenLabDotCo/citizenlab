import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import FilterSelector from 'components/FilterSelector';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import { PARTICIPATION_METHOD_LABELS } from '../constants';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

type Option = {
  value: ParticipationMethod;
  text: string;
};

const sortAlphabetically = (a: Option, b: Option) => {
  if (a.text < b.text) {
    return -1;
  }
  if (a.text > b.text) {
    return 1;
  }
  return 0;
};

const Method = () => {
  const participationMethods = useRansackParam(
    'q[phases_participation_method_in]'
  );
  const { formatMessage } = useIntl();

  const options = keys(PARTICIPATION_METHOD_LABELS)
    .filter((key) => key !== 'survey')
    .map((key) => ({
      value: key,
      text: formatMessage(PARTICIPATION_METHOD_LABELS[key]),
    }))
    .sort(sortAlphabetically);

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={participationMethods ?? []}
      values={options}
      mr="0px"
      onChange={(
        participationMethods: Exclude<ParticipationMethod, 'survey'>[]
      ) => {
        setRansackParam(
          'q[phases_participation_method_in]',
          participationMethods
        );
        trackEventByName(tracks.setMethod, {
          methods: JSON.stringify(participationMethods),
        });
      }}
      title={formatMessage(messages.method)}
      name="method-select"
    />
  );
};

export default Method;
