import React from 'react';

import { ReviewState } from 'api/admin_publications/types';
import useAuthUser from 'api/me/useAuthUser';
import { PublicationStatus } from 'api/projects/types';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import { PUBLICATION_STATUS_LABELS } from '../../constants';
import { useParam, setParam } from '../../params';

import messages from './messages';

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
  mr?: string;
}

const Status = ({ mr }: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useAuthUser();
  const isUserAdmin = isAdmin(user);
  const statuses = useParam('status') ?? [];

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

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={statuses}
      values={options}
      mr={mr}
      onChange={(statuses) => {
        setParam('status', statuses as PublicationStatus[]);
      }}
      title={formatMessage(messages.status)}
      name="manager-select"
    />
  );
};

export default Status;
