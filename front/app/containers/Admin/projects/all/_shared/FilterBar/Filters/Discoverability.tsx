import React, { useRef } from 'react';

import { Discoverability } from 'api/projects_mini_admin/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import { useFilterOpenByDefault } from './hooks/useFilterOpenByDefault';
import messages from './messages';
import tracks from './tracks';

const OPTIONS: {
  value: Discoverability;
  message: MessageDescriptor;
}[] = [
  {
    value: 'listed',
    message: messages.discoverabilityPublic,
  },
  {
    value: 'unlisted',
    message: messages.discoverabilityHidden,
  },
];

interface Props {
  onClear: () => void;
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const DiscoverabilityFilter = ({
  onClear,
  shouldOpenByDefault,
  onOpened,
}: Props) => {
  const value = useParam('discoverability') ?? [];
  const { formatMessage } = useIntl();
  const filterRef = useRef<HTMLDivElement>(null);

  const { isOpened, setIsOpened } = useFilterOpenByDefault({
    shouldOpenByDefault,
    onOpened,
    filterRef,
  });

  const options = OPTIONS.map((option) => ({
    label: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <div ref={filterRef}>
      <MultiSelect
        title={formatMessage(messages.discoverabilityLabel)}
        options={options}
        selected={value}
        onChange={(discoverability) => {
          setParam('discoverability', discoverability as Discoverability[]);
          trackEventByName(tracks.setDiscoverability, {
            discoverabilities: JSON.stringify(discoverability),
          });
        }}
        onClear={onClear}
        dataCy="projects-overview-filter-discoverability"
        opened={isOpened}
        onOpen={() => setIsOpened(true)}
      />
    </div>
  );
};

export default DiscoverabilityFilter;
