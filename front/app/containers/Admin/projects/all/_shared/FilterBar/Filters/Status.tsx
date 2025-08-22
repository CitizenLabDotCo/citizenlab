import React from 'react';

import { PublicationStatus } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { PUBLICATION_STATUS_LABELS } from '../../constants';
import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

const OPTIONS = [
  { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
  { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
  { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
] as const;

interface Props {
  openedDefaultValue?: boolean;
  mr?: string;
  onClear?: () => void;
}

const Status = ({ openedDefaultValue = false, mr, onClear }: Props) => {
  const { formatMessage } = useIntl();
  const statuses = useParam('status') ?? [];

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <MultiSelect
      selected={statuses}
      options={options}
      mr={mr}
      openedDefaultValue={openedDefaultValue && statuses.length === 0}
      onChange={(statuses) => {
        setParam('status', statuses as PublicationStatus[]);
        trackEventByName(tracks.setStatus, {
          statuses: JSON.stringify(statuses),
        });
      }}
      title={formatMessage(messages.status)}
      onClear={onClear}
      dataCy="projects-overview-filter-status"
    />
  );
};

export default Status;
