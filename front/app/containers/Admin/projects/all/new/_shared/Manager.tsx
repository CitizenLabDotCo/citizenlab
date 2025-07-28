import React from 'react';

import { MultiSelect } from '@citizenlab/cl2-component-library';

import useUsers from 'api/users/useUsers';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

interface Props {
  managerIds: string[];
  mr?: string;
  onChange: (managers: string[]) => void;
}

const Manager = ({ managerIds, mr = '0px', onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: managers } = useUsers({
    pageSize: 500,
    can_moderate: true,
  });

  const options =
    managers?.data.map((manager) => ({
      value: manager.id,
      label: getFullName(manager),
    })) ?? [];

  return (
    <MultiSelect
      selected={managerIds}
      options={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.manager)}
    />
  );
};

export default Manager;
