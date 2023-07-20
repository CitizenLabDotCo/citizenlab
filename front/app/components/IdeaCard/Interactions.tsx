import React from 'react';

// config
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';

// utils
import { isCurrentPhase } from 'api/phases/utils';

// types
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

type InteractionsProps = {
  idea: IIdea;
  participationContext?: IPhaseData | IProjectData | null;
};

const Interactions = ({ participationContext, idea }: InteractionsProps) => {
  const votingMethod = participationContext?.attributes.voting_method;
  const config = getVotingMethodConfig(votingMethod);

  if (!config || !participationContext) return null;

  if (
    participationContext.type === 'phase' &&
    !isCurrentPhase(participationContext)
  ) {
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
