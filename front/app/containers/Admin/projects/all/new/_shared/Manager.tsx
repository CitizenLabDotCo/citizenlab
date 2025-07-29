import React from 'react';

import useUsers from 'api/users/useUsers';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

interface Props {
  values: string[];
  mr?: string;
  onChange: (managers: string[]) => void;
}

const Manager = ({ values, mr = '0px', onChange }: Props) => {
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
      selected={values}
      values={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.manager)}
      name="manager-select"
    />
  );
};

export default Manager;
