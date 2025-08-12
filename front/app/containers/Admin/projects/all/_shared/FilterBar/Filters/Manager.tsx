import React, { useState, useRef } from 'react';

import useUsers from 'api/users/useUsers';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import { useParam, setParam } from '../../params';

import { useFilterOpenByDefault } from './hooks/useFilterOpenByDefault';
import messages from './messages';
import tracks from './tracks';

interface Props {
  mr?: string;
  onClear?: () => void;
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const Manager = ({
  mr = '0px',
  onClear,
  shouldOpenByDefault,
  onOpened,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  const managerIds = useParam('managers') ?? [];
  const { formatMessage } = useIntl();

  const { data: managers } = useUsers({
    pageSize: 500,
    can_moderate: true,
  });

  const { isOpened, setIsOpened } = useFilterOpenByDefault({
    shouldOpenByDefault,
    onOpened,
    filterRef,
  });

  const getOptions = () => {
    if (!managers) return [];
    const managersWithFullname = managers.data.map((manager) => ({
      value: manager.id,
      label: getFullName(manager),
    }));

    if (searchValue === '') return managersWithFullname;

    return managersWithFullname.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const options = getOptions();

  const sortedOptions = options.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  );

  return (
    <div ref={filterRef}>
      <MultiSelect
        selected={managerIds}
        options={sortedOptions}
        searchValue={searchValue}
        mr={mr}
        onChange={(managerIds) => {
          setParam('managers', managerIds);
          trackEventByName(tracks.setManager, {
            managerIds: JSON.stringify(managerIds),
          });
        }}
        onSearch={setSearchValue}
        title={formatMessage(messages.manager)}
        onClear={onClear}
        dataCy="projects-overview-filter-managers"
        opened={isOpened}
        onOpen={() => setIsOpened(true)}
      />
    </div>
  );
};

export default Manager;
