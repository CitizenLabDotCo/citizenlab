import React from 'react';

import { Visibility } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

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
  onClear: () => void;
}

const VisibilityFilter = ({ onClear }: Props) => {
  const visibilities = useParam('visibility') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    label: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <MultiSelect
      title={formatMessage(messages.visibilityLabel)}
      options={options}
      selected={visibilities}
      openedDefaultValue={visibilities.length === 0}
      onChange={(visibilities) => {
        setParam('visibility', visibilities as Visibility[]);
        trackEventByName(tracks.setVisibility, {
          visibilities: JSON.stringify(visibilities),
        });
      }}
      onClear={onClear}
    />
  );
};

export default VisibilityFilter;
