import React, { useRef } from 'react';

import { Visibility } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import { useFilterOpenByDefault } from './hooks/useFilterOpenByDefault';
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
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const VisibilityFilter = ({
  onClear,
  shouldOpenByDefault,
  onOpened,
}: Props) => {
  const visibilities = useParam('visibility') ?? [];
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
        title={formatMessage(messages.visibilityLabel)}
        options={options}
        selected={visibilities}
        onChange={(visibilities) => {
          setParam('visibility', visibilities as Visibility[]);
          trackEventByName(tracks.setVisibility, {
            visibilities: JSON.stringify(visibilities),
          });
        }}
        onClear={onClear}
        dataCy="projects-overview-filter-visibility"
        opened={isOpened}
        onOpen={() => setIsOpened(true)}
      />
    </div>
  );
};

export default VisibilityFilter;
