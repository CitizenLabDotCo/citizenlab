import React from 'react';

// config

import useBasket from 'api/baskets/useBasket';
import { IIdea } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isPhaseActive } from 'utils/projectUtils';

type Props = {
  idea: IIdea;
  phase: IPhaseData | null;
};

const Interactions = ({ idea, phase }: Props) => {
  const isGeneralIdeasPage = window.location.pathname.endsWith('/ideas');
  const votingMethod = phase?.attributes.voting_method;

  const config = getVotingMethodConfig(votingMethod);
  const { data: basket } = useBasket(
    phase?.relationships?.user_basket?.data?.id
  );

  if (!config || !phase) return null;

  const showingVotingResults =
    !isPhaseActive(phase) &&
    phase?.attributes.participation_method === 'voting' &&
    phase?.attributes.autoshare_results_enabled;

  const phaseNotActiveAndNotVoting = !isPhaseActive(phase) && !votingMethod;

  if (phaseNotActiveAndNotVoting || showingVotingResults) {
    return null;
  }

  const phaseEnded =
    phase.attributes.end_at &&
    pastPresentOrFuture(phase?.attributes?.end_at) === 'past';

  const hideInteractions =
    isGeneralIdeasPage ||
    (phaseEnded && basket?.data.attributes.submitted_at === null)
      ? true
      : false;

  if (hideInteractions) {
    return null;
  }

  return (
    <>
      {config.getIdeaCardVoteInput({
        ideaId: idea.data.id,
        phase,
      })}
    </>
  );
};

export default Interactions;
