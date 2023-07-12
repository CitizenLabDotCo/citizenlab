import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from 'components/AddToBasketButton';
import AssignMultipleVotesControl from 'components/AssignMultipleVotesControl';
import AssignSingleVoteButton from 'components/AssignSingleVoteButton';

// types
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

type InteractionsProps = {
  idea: IIdea;
  participationContext?: IPhaseData | IProjectData | null;
};
export const getInteractions = ({
  participationContext,
  idea,
}: InteractionsProps) => {
  if (participationContext) {
    const ideaBudget = idea.data.attributes.budget;
    const votingMethod = participationContext.attributes.voting_method;

    const showSingleVoteControl = votingMethod === 'single_voting';
    const showMultipleVoteControl = votingMethod === 'multiple_voting';
    const showBudgetControl = votingMethod === 'budgeting' && ideaBudget;

    if (showBudgetControl) {
      return (
        <Box display="flex" alignItems="center">
          <Box w="100%" className="e2e-assign-budget">
            <AddToBasketButton
              ideaId={idea.data.id}
              participationContext={participationContext}
              buttonStyle="primary-outlined"
            />
          </Box>
        </Box>
      );
    }
    if (showMultipleVoteControl) {
      return (
        <Box display="flex" alignItems="center">
          <AssignMultipleVotesControl
            ideaId={idea.data.id}
            participationContext={participationContext}
          />
        </Box>
      );
    }
    if (showSingleVoteControl) {
      return (
        <Box display="flex" alignItems="center">
          <AssignSingleVoteButton
            ideaId={idea.data.id}
            participationContext={participationContext}
            buttonStyle="primary-outlined"
          />
        </Box>
      );
    }
  }
  return null;
};
