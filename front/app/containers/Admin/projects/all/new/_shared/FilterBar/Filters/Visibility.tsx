import React from 'react';

import { Visibility } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';
import messages from '../messages';

const OPTIONS: {
  value: Visibility;
  message: MessageDescriptor;
}[] = [
  {
    value: 'public',
    message: messages.visibilityPublic,
  },
  {
    value: 'groups',
    message: messages.visibilityGroups,
  },
  {
    value: 'admins',
    message: messages.visibilityAdmins,
  },
];

const VisibilityFilter = () => {
  const visibilities = useParam('visibility') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    text: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <FilterSelector
      title={formatMessage(messages.visibilityLabel)}
      name="visibility-filter"
      values={options}
      selected={visibilities}
      onChange={(visibilities) => {
        setParam('visibility', visibilities as Visibility[]);
      }}
      multipleSelectionAllowed={true}
    />
  );
};

export default VisibilityFilter;
