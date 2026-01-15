import { IPhaseData } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  phase: IPhaseData;
  localize: ReturnType<typeof useLocalize>;
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
};

const getTextNumberOfVotes = ({
  numberOfVotes,
  phase,
  formatMessage,
}: Props & { numberOfVotes: number }) => {
  return formatMessage(
    getPhaseVoteTermMessage(phase, {
      vote: messages.numberOfVotes,
      point: messages.numberOfPoints,
      token: messages.numberOfTokens,
      credit: messages.numberOfCredits,
      percent: messages.numberOfPercents,
    }),
    {
      numberOfVotes,
    }
  );
};

export { getTextNumberOfVotes };
