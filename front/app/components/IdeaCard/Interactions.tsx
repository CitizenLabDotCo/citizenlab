import React from 'react';

// api
import useBasket from 'api/baskets/useBasket';

// config
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// types
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

type Props = {
  idea: IIdea;
  participationContext?: IPhaseData | IProjectData | null;
};

const Interactions = ({ participationContext, idea }: Props) => {
  const isGeneralIdeasPage = window.location.pathname.endsWith('/ideas');
  const votingMethod = participationContext?.attributes.voting_method;
  const config = getVotingMethodConfig(votingMethod);
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  if (!config || !participationContext) return null;

  if (
    participationContext.type === 'phase' &&
    pastPresentOrFuture([
      participationContext.attributes.start_at,
      participationContext.attributes.end_at,
    ]) !== 'present'
  ) {
    return null;
  }

  const participationContextEnded =
    participationContext?.type === 'phase' &&
    participationContext.attributes.end_at &&
    pastPresentOrFuture(participationContext?.attributes?.end_at) === 'past';

  const hideInteractions =
    isGeneralIdeasPage ||
    (participationContextEnded && basket?.data.attributes.submitted_at === null)
      ? true
      : false;

  if (hideInteractions) {
    return null;
  }

  return (
    <>
      {config.getIdeaCardVoteInput({
        ideaId: idea.data.id,
        participationContext,
      })}
    </>
  );
};

export default Interactions;
