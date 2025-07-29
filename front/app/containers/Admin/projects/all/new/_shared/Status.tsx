import React from 'react';

import { PublicationStatus } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { useIntl } from 'utils/cl-intl';

import { PUBLICATION_STATUS_LABELS } from '../constants';
import messages from '../Projects/Filters/messages';

type Option = {
  value: PublicationStatus;
  label: string;
};

const OPTIONS = [
  { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
  { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
  { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
] as const;

interface Props {
  values: PublicationStatus[];
  mr?: string;
  onChange: (value: PublicationStatus[]) => void;
}

const Status = ({ values, mr, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options: Option[] = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <MultiSelect
      selected={values}
      options={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.status)}
    />
  );
};

export default Status;
