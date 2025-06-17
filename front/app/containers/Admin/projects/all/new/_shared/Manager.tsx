import React from 'react';

import useUsers from 'api/users/useUsers';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../Projects/Filters/messages';
import { useParam, setParam } from '../Projects/utils';

interface Props {
  mr?: string;
}

const Manager = ({ mr = '0px' }: Props) => {
  const { formatMessage } = useIntl();
  const values = useParam('managers') ?? [];
  const { data: managers } = useUsers({
    pageSize: 500,
    can_admin: true,
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
      onChange={(value) => {
        setParam('managers', value);
      }}
      title={formatMessage(messages.manager)}
      name="manager-select"
    />
  );
};

export default Manager;
