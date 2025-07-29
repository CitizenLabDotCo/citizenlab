import React from 'react';

import useUsers from 'api/users/useUsers';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

import { useParam, setParam } from './params';

interface Props {
  mr?: string;
}

const Manager = ({ mr = '0px' }: Props) => {
  const managerIds = useParam('managers') ?? [];
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
      selected={managerIds}
      values={options}
      mr={mr}
      onChange={(managerIds) => {
        setParam('managers', managerIds);
      }}
      title={formatMessage(messages.manager)}
      name="manager-select"
    />
  );
};

export default Manager;
