import React from 'react';

import { PublicationStatus } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';

import { PUBLICATION_STATUS_LABELS } from '../constants';
import messages from '../Projects/Filters/messages';

type Option = {
  value: PublicationStatus;
  text: string;
};

const OPTIONS = [
  { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
  { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
  { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
] as const;

interface Props {
  value: PublicationStatus[];
  mr?: string;
  onChange: (value: PublicationStatus[]) => void;
}

const Status = ({ value, mr, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options: Option[] = OPTIONS.map((option) => ({
    value: option.value,
    text: formatMessage(option.message),
  }));

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={value}
      values={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.status)}
      name="manager-select"
    />
  );
};

export default Status;
