import React, { useRef } from 'react';

import { PublicationStatus } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { PUBLICATION_STATUS_LABELS } from '../../constants';
import { useParam, setParam } from '../../params';

import { useFilterOpenByDefault } from './hooks/useFilterOpenByDefault';
import messages from './messages';
import tracks from './tracks';

const OPTIONS = [
  { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
  { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
  { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
] as const;

interface Props {
  mr?: string;
  onClear?: () => void;
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const Status = ({ mr, onClear, shouldOpenByDefault, onOpened }: Props) => {
  const { formatMessage } = useIntl();
  const statuses = useParam('status') ?? [];
  const filterRef = useRef<HTMLDivElement>(null);

  const { isOpened, setIsOpened } = useFilterOpenByDefault({
    shouldOpenByDefault,
    onOpened,
    filterRef,
  });

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <div ref={filterRef}>
      <MultiSelect
        selected={statuses}
        options={options}
        mr={mr}
        onChange={(statuses) => {
          setParam('status', statuses as PublicationStatus[]);
          trackEventByName(tracks.setStatus, {
            statuses: JSON.stringify(statuses),
          });
        }}
        title={formatMessage(messages.status)}
        onClear={onClear}
        dataCy="projects-overview-filter-status"
        opened={isOpened}
        onOpen={() => setIsOpened(true)}
      />
    </div>
  );
};

export default Status;
