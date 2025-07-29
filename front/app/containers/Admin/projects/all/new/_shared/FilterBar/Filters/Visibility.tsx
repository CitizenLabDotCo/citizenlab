import React from 'react';

import { Visibility } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

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

interface Props {
  value: Visibility[];
  onChange: (values: Visibility[]) => void;
}

const VisibilityFilter = ({ value, onChange }: Props) => {
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
      selected={value}
      onChange={onChange}
      multipleSelectionAllowed={true}
    />
  );
};

export default VisibilityFilter;
