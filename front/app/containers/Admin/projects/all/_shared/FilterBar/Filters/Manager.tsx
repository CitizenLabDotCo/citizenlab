import React, { useState } from 'react';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';
import useManagerOptions from './useManagerOptions';

interface Props {
  openedDefaultValue?: boolean;
  mr?: string;
  onClear?: () => void;
}

const Manager = ({
  openedDefaultValue = false,
  mr = '0px',
  onClear,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');

  const managerIds = useParam('managers') ?? [];
  const { formatMessage } = useIntl();

  const { options: managerOptions } = useManagerOptions();

  const options =
    searchValue === ''
      ? managerOptions
      : managerOptions.filter((option) =>
          option.label.toLowerCase().includes(searchValue.toLowerCase())
        );

  return (
    <MultiSelect
      selected={managerIds}
      options={options}
      searchValue={searchValue}
      mr={mr}
      openedDefaultValue={openedDefaultValue && managerIds.length === 0}
      onChange={(managerIds) => {
        setParam('managers', managerIds);
        trackEventByName(tracks.setManager, {
          managerIds: JSON.stringify(managerIds),
        });
      }}
      onSearch={setSearchValue}
      title={formatMessage(messages.manager)}
      onClear={onClear}
    />
  );
};

export default Manager;
