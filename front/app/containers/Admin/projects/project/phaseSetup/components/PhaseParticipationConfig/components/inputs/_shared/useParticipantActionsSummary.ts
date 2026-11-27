import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

interface Actions {
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
}

const useParticipantActionsSummary = ({
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
}: Actions) => {
  const { formatMessage } = useIntl();
  const on = [
    { action: 'submit', enabled: submission_enabled },
    { action: 'comment', enabled: commenting_enabled },
    { action: 'react', enabled: reacting_enabled },
  ]
    .filter(({ enabled }) => enabled)
    .map(({ action }) => action);

  if (on.length === 0) return undefined;

  return formatMessage(messages.participantActionsSummary, {
    action: on[0],
    others: on.length - 1,
  });
};

export default useParticipantActionsSummary;
