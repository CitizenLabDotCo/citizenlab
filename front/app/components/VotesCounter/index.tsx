import React, { useMemo } from 'react';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCumulativeVoting from 'api/baskets_ideas/useVoting';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

interface Props {
  projectId: string;
}

const VotesCounter = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: appConfig } = useAppConfiguration();
  const { numberOfVotesCast } = useCumulativeVoting();

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases?.data) || getLastPhase(phases?.data);
  }, [phases]);

  const currentParticipationContext = currentPhase ?? project?.data;

  if (!currentParticipationContext) return null;

  const votingMethod = currentParticipationContext.attributes.voting_method;

  const getVoteTerm = () => {
    if (votingMethod === 'single_voting') {
      return formatMessage(messages.votes);
    }

    const term =
      currentParticipationContext.attributes.voting_term_plural_multiloc;
    if (!term) return;

    return localize(term).toLowerCase();
  };

  const votingMaxTotal =
    currentParticipationContext.attributes.voting_max_total;

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
