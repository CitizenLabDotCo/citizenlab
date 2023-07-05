import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from 'components/AddToBasketButton';
import AssignMultipleVotesControl from 'components/AssignMultipleVotesControl';
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import AssignSingleVoteControl from 'components/AssignSingleVoteControl';

type InteractionsProps = {
  idea: IIdea;
  project?: IProjectData | null;
  phase?: IPhaseData | null;
};
export const getInteractions = ({
  project,
  phase,
  idea,
}: InteractionsProps) => {
  if (project) {
    const projectId = idea.data.relationships.project.data.id;
    const ideaBudget = idea.data.attributes.budget;
    const participationContext = phase || project;
    const votingMethod = participationContext.attributes.voting_method;

    const showSingleVoteControl = votingMethod === 'single_voting';
    const showMultipleVoteControl = votingMethod === 'multiple_voting';
    const showBudgetControl = votingMethod === 'budgeting' && ideaBudget;

    if (showBudgetControl) {
      return (
        <Box display="flex" alignItems="center">
          <Box w="100%" className="e2e-assign-budget">
            <AddToBasketButton
              viewingPhase={phase}
              buttonStyle="primary-outlined"
              projectId={projectId}
              ideaId={idea.data.id}
            />
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
            // viewingPhase={phase} // TODO: After Luuc is finished, add support for viewing phase phases (using viewingPhase)
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
            viewingPhase={phase}
          />
        </Box>
      );
    }
  }
  return null;
};
