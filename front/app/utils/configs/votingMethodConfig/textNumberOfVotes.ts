import { IPhaseData, VoteTerm } from 'api/phases/types';
import { getPhaseVoteTerm } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

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
  const voteTerm = getPhaseVoteTerm(phase);
  const numberOfVotesMessages: { [key in VoteTerm]: MessageDescriptor } = {
    vote: messages.numberOfVotes,
    point: messages.numberOfPoints,
    token: messages.numberOfTokens,
    credit: messages.numberOfCredits,
  };
  const numberOfVotesMessage = numberOfVotesMessages[voteTerm];

  return formatMessage(numberOfVotesMessage, {
    numberOfVotes,
  });
};

export { getTextNumberOfVotes };
