import React, { useMemo } from 'react';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';

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

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases?.data) || getLastPhase(phases?.data);
  }, [phases]);

  const currentParticipationContext = currentPhase ?? project?.data;
  const basketId =
    currentParticipationContext?.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const votingMethod = currentParticipationContext?.attributes.voting_method;

  const getVoteTerm = () => {
    if (votingMethod === 'single_voting') {
      return formatMessage(messages.votes);
    }

    const term =
      currentParticipationContext?.attributes.voting_term_plural_multiloc;
    if (!term) return;

    return localize(term).toLowerCase();
  };

  const votingMaxTotal =
    currentParticipationContext?.attributes.voting_max_total;
  const totalVotes = basket?.data.attributes.total_votes;

  const currency =
    votingMethod === 'budgeting'
      ? appConfig?.data.attributes.settings.core.currency
      : undefined;

  if (votingMaxTotal) {
    return (
      <>
        {(votingMaxTotal - (totalVotes || 0)).toLocaleString()} /{' '}
        {votingMaxTotal.toLocaleString()}{' '}
        {votingMethod !== 'budgeting' ? getVoteTerm() : currency}{' '}
        {formatMessage(messages.left)}
      </>
    );
  }
  if (!votingMaxTotal && totalVotes) {
    return (
      <>
        {`${formatMessage(messages.votedFor)} ${totalVotes} ${formatMessage(
          messages.xOptions,
          {
            votes: totalVotes,
          }
        )}`}
      </>
    );
  }
  return <>{formatMessage(messages.voteForAtLeastOne)}</>;
};

export default VotesCounter;
