import React from 'react';

import useUsers from 'api/users/useUsers';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

interface Props {
  value: string[];
  mr?: string;
  onChange: (value: string[]) => void;
}

const Manager = ({ value, mr = '0px', onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: managers } = useUsers({
    pageSize: 500,
    can_moderate: true,
  });

  const options =
    managers?.data.map((manager) => ({
      value: manager.id,
      text: getFullName(manager),
    })) ?? [];

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={value}
      values={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.manager)}
      name="manager-select"
    />
  );
};

export default Manager;
