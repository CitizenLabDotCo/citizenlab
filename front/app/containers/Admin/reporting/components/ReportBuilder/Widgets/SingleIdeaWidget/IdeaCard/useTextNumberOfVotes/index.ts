import { IPhaseData } from 'api/phases/types';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const useTextNumberOfVotes = ({
  numberOfVotes,
  phase,
}: {
  numberOfVotes: number;
  phase: IPhaseData;
}) => {
  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.attributes;
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const voteTerm = voting_term_singular_multiloc
    ? localize(voting_term_singular_multiloc)
    : formatMessage(messages.vote);
  const votesTerm = voting_term_plural_multiloc
    ? localize(voting_term_plural_multiloc)
    : formatMessage(messages.votes);

  return formatMessage(messages.numberOfVotes, {
    numberOfVotes: numberOfVotes.toLocaleString(),
    voteTerm,
    votesTerm,
  });
};

export default useTextNumberOfVotes;
