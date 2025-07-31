import React from 'react';

import { ReviewState } from 'api/admin_publications/types';
import useAuthUser from 'api/me/useAuthUser';
import { PublicationStatus } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import { PUBLICATION_STATUS_LABELS } from '../constants';
import messages from '../Projects/Filters/messages';

type OptionValue = PublicationStatus | 'pending_approval';

type Option = {
  value: OptionValue;
  text: string;
};

const ADMIN_ONLY_OPTIONS = [
  {
    value: 'pending_approval',
    message: PUBLICATION_STATUS_LABELS.pending_approval,
  },
] as const;

interface Props {
  selectedStatuses: PublicationStatus[];
  selectedReviewState?: ReviewState;
  mr?: string;
  onChange: (params: {
    statuses: PublicationStatus[];
    reviewState?: 'pending';
  }) => void;
}

const Status = ({
  selectedStatuses,
  selectedReviewState,
  mr,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useAuthUser();
  const isUserAdmin = isAdmin(user);

  const OPTIONS = [
    { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
    ...(isUserAdmin ? ADMIN_ONLY_OPTIONS : []),
    { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
    { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
  ] as const;

  const options: Option[] = OPTIONS.map((option) => ({
    value: option.value,
    text: formatMessage(option.message),
  }));

  const selectedValues: OptionValue[] = [...selectedStatuses];
  if (selectedReviewState === 'pending') {
    selectedValues.push('pending_approval');
  }

  const handleChange = (values: OptionValue[]) => {
    const reviewState = values.includes('pending_approval')
      ? 'pending'
      : undefined;
    const statuses = values.filter(
      (v) => v !== 'pending_approval'
    ) as PublicationStatus[];

    onChange({ statuses, reviewState });
  };

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={selectedValues}
      values={options}
      mr={mr}
      onChange={handleChange}
      title={formatMessage(messages.status)}
      name="manager-select"
    />
  );
};

export default Status;
