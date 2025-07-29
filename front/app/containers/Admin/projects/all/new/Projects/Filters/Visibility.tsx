import React from 'react';

import { Visibility } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

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
  visibility: Visibility[];
  onChange: (values: Visibility[]) => void;
}

const VisibilityFilter = ({ visibility, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    label: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <MultiSelect
      title={formatMessage(messages.visibilityLabel)}
      options={options}
      selected={visibility}
      onChange={onChange}
    />
  );
};

export default VisibilityFilter;
