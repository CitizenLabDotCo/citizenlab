import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from 'components/AddToBasketButton';
import AssignMultipleVotesControl from 'components/AssignMultipleVotesControl';
import { IIdea } from 'api/ideas/types';
import { IProject } from 'api/projects/types';
import { IPhase } from 'api/phases/types';
import AssignSingleVoteControl from 'components/AssignSingleVoteControl';

type InteractionsProps = {
  idea: IIdea;
  project?: IProject | null;
  viewingPhase?: IPhase | null;
};
export const getInteractions = ({
  project,
  viewingPhase,
  idea,
}: InteractionsProps) => {
  if (project) {
    const projectId = idea.data.relationships.project.data.id;
    const ideaBudget = idea.data.attributes.budget;
    const participationContext = viewingPhase || project;
    const votingMethod = participationContext.data.attributes.voting_method;

    const showSingleVoteControl = votingMethod === 'single_voting';
    const showMultipleVoteControl = votingMethod === 'multiple_voting';
    const showBudgetControl = votingMethod && ideaBudget;

    if (showBudgetControl) {
      return (
        <Box display="flex" alignItems="center">
          <Box w="100%" className="e2e-assign-budget">
            <AddToBasketButton projectId={projectId} ideaId={idea.data.id} />
          </Box>
        </Box>
      );
    }
    if (showMultipleVoteControl) {
      return (
        <Box display="flex" alignItems="center">
          <AssignMultipleVotesControl
            projectId={projectId}
            ideaId={idea.data.id}
          />
        </Box>
      );
    }
    if (showSingleVoteControl) {
      return (
        <Box display="flex" alignItems="center">
          <AssignSingleVoteControl
            projectId={projectId}
            ideaId={idea.data.id}
          />
        </Box>
      );
    }
  }
  return null;
};
