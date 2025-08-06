import React from 'react';

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
    value: 'pending_approval',
    message: PUBLICATION_STATUS_LABELS.pending_approval,
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

  return (
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
    />
  );
};

export default Status;
