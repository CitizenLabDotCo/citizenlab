import React from 'react';

import { ReviewState } from 'api/admin_publications/types';
import useAuthUser from 'api/me/useAuthUser';
import { PublicationStatus } from 'api/projects/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import { PUBLICATION_STATUS_LABELS } from '../../constants';
import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

const ADMIN_ONLY_OPTIONS = [
  {
    value: 'pending',
    message: PUBLICATION_STATUS_LABELS.pending,
  },
] as const;

interface Props {
  mr?: string;
  onClear?: () => void;
}

const Status = ({ mr, onClear }: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useAuthUser();
  const isUserAdmin = isAdmin(user);
  const statuses = useParam('status') ?? [];
  const reviewState = useParam('review_state');

  const OPTIONS = [
    { value: 'draft', message: PUBLICATION_STATUS_LABELS.draft },
    ...(isUserAdmin ? ADMIN_ONLY_OPTIONS : []),
    { value: 'published', message: PUBLICATION_STATUS_LABELS.published },
    { value: 'archived', message: PUBLICATION_STATUS_LABELS.archived },
  ] as const;

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  // Combine statuses with review_state for display purposes
  const selectedValues = [
    ...statuses,
    ...(reviewState === 'pending' ? ['pending'] : []),
  ];

  const handleClear = () => {
    setParam('status', []);
    setParam('review_state', undefined);
    if (onClear) {
      onClear();
    }
  };

  return (
    <MultiSelect
      selected={selectedValues}
      options={options}
      mr={mr}
      onChange={(statuses) => {
        // Separate pending approval from actual publication statuses
        const actualStatuses = statuses.filter(
          (status) => status !== 'pending'
        ) as PublicationStatus[];
        const hasPendingApproval = statuses.includes('pending');

        // Set the status parameter with only actual publication statuses
        setParam('status', actualStatuses);

        if (hasPendingApproval) {
          setParam('review_state', 'pending' as ReviewState);
        } else {
          setParam('review_state', undefined);
        }

        trackEventByName(tracks.setStatus, {
          statuses: JSON.stringify(statuses),
        });
      }}
      title={formatMessage(messages.status)}
      onClear={handleClear}
    />
  );
};

export default Status;
