import React from 'react';

import { Visibility } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

const OPTIONS: {
  value: Visibility | 'unlisted';
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
  {
    value: 'unlisted',
    message: messages.visibilityUnlisted,
  },
];

interface Props {
  visibility: (Visibility | 'unlisted')[];
  onChange: (values: (Visibility | 'unlisted')[]) => void;
}

const VisibilityFilter = ({ visibility, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const values = OPTIONS.map((option) => ({
    text: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <FilterSelector
      title={formatMessage(messages.visibilityLabel)}
      name="visibility-filter"
      values={values}
      selected={visibility}
      onChange={onChange}
      multipleSelectionAllowed={true}
    />
  );
};

export default VisibilityFilter;
