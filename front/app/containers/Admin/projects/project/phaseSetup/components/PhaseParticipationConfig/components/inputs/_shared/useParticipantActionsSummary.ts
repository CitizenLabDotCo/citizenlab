import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

interface Actions {
  adding_statements?: boolean | null;
  voting?: boolean;
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
}

const useParticipantActionsSummary = ({
  adding_statements,
  voting,
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
}: Actions) => {
  const { formatMessage } = useIntl();
  const on = [
    { action: 'add_statements', enabled: adding_statements },
    { action: 'vote', enabled: voting },
    { action: 'submit', enabled: submission_enabled },
    { action: 'comment', enabled: commenting_enabled },
    { action: 'react', enabled: reacting_enabled },
  ]
    .filter(({ enabled }) => enabled)
    .map(({ action }) => action);

  if (on.length === 0) return undefined;

  return formatMessage(messages.participantActionsSummary2, {
    action: on[0],
    others: on.length - 1,
  });
};

export default useParticipantActionsSummary;
