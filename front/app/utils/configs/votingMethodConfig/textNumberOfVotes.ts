import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  phase: IPhaseData;
  localize: ReturnType<typeof useLocalize>;
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
};

const getVoteTerms = ({ phase, localize, formatMessage }: Props) => {
  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.attributes;

  const voteTerm = voting_term_singular_multiloc
    ? localize(voting_term_singular_multiloc)
    : formatMessage(messages.midSentenceVote);
  const votesTerm = voting_term_plural_multiloc
    ? localize(voting_term_plural_multiloc)
    : formatMessage(messages.midSentenceVotes);

  return { voteTerm, votesTerm };
};

const getTextNumberOfVotes = ({
  numberOfVotes,
  phase,
  localize,
  formatMessage,
}: Props & { numberOfVotes: number }) => {
  const { voteTerm, votesTerm } = getVoteTerms({
    phase,
    localize,
    formatMessage,
  });

  return formatMessage(messages.numberOfVotes, {
    numberOfVotes: numberOfVotes.toLocaleString(),
    voteTerm,
    votesTerm,
  });
};

export { getTextNumberOfVotes };
