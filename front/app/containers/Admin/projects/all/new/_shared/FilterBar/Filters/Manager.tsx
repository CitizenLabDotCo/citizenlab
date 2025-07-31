import React from 'react';

import useUsers from 'api/users/useUsers';

import MultiSelect from 'components/UI/MultiSelect';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import { useParam, setParam } from '../../params';

import messages from './messages';

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
      label: getFullName(manager),
    })) ?? [];

  return (
    <MultiSelect
      selected={managerIds}
      options={options}
      mr={mr}
      onChange={(managerIds) => {
        setParam('managers', managerIds);
      }}
      title={formatMessage(messages.manager)}
    />
  );
};

export default Manager;
