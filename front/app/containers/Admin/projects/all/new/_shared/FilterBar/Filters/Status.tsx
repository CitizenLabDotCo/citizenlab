import React from 'react';

import { PublicationStatus } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { useIntl } from 'utils/cl-intl';

import { PUBLICATION_STATUS_LABELS } from '../../constants';
import { useParam, setParam } from '../../params';

import messages from './messages';

const OPTIONS = [
  { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
  { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
  { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
] as const;

interface Props {
  mr?: string;
}

const Status = ({ mr }: Props) => {
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
      onChange={(statuses) => {
        setParam('status', statuses as PublicationStatus[]);
      }}
      title={formatMessage(messages.status)}
    />
  );
};

export default Status;
