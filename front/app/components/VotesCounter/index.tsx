import React from 'react';

// api
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useVoting from 'api/baskets_ideas/useVoting';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  participationContext: IProjectData | IPhaseData;
}

const VotesCounter = ({ participationContext }: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const { numberOfVotesCast } = useVoting();

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const votingMethod = participationContext.attributes.voting_method;

  const getVoteTerm = () => {
    if (votingMethod === 'single_voting') {
      return formatMessage(messages.votes);
    }

    const { voting_term_plural_multiloc } = participationContext.attributes;
    if (!voting_term_plural_multiloc) return;

    return localize(voting_term_plural_multiloc);
  };

  const votingMaxTotal = participationContext.attributes.voting_max_total;

  const currency =
    votingMethod === 'budgeting'
      ? appConfig?.data.attributes.settings.core.currency
      : undefined;

  if (votingMaxTotal) {
    return (
      <>
        {(votingMaxTotal - (numberOfVotesCast ?? 0)).toLocaleString()} /{' '}
        {votingMaxTotal.toLocaleString()}{' '}
        {votingMethod !== 'budgeting' ? getVoteTerm() : currency}{' '}
        {formatMessage(messages.left)}
      </>
    );
  }
  if (!votingMaxTotal && numberOfVotesCast) {
    return (
      <>
        {`${formatMessage(
          messages.votedFor
        )} ${numberOfVotesCast} ${formatMessage(messages.xOptions, {
          votes: numberOfVotesCast,
        })}`}
      </>
    );
  }
  return <>{formatMessage(messages.voteForAtLeastOne)}</>;
};

export default VotesCounter;
