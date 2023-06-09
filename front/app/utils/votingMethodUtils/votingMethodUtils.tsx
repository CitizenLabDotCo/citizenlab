import { VotingMethod } from 'services/participationContexts';
import messages from './messages';
import { MessageDescriptor } from 'react-intl';
import React from 'react';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { FormattedMessage } from 'utils/cl-intl';

/*
  Configuration Specification
  
  StatusModule:
  - getStatusTitle: Returns title for the status module
  - getStatusDescription: Returns description for the status module
  - getStatusSubmissionCountCopy: Returns copy related to the submission count
  - getSubmissionTerm: Returns the submission type in plural form (e.g. 'budgets')
  */

export type VoteSubmissionState =
  | 'hasNotSubmitted'
  | 'hasSubmitted'
  | 'submissionEnded';

export type VotingMethodConfig = {
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: () => MessageDescriptor;
  getStatusDescription?: (
    project: IProjectData,
    phase?: IPhaseData
  ) => JSX.Element;
  getSubmissionTerm?: () => MessageDescriptor;
};

const budgetingConfig: VotingMethodConfig = {
  getStatusTitle: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.howToParticipate;
      case 'hasSubmitted':
        return messages.budgetSubmitted;
      case 'submissionEnded':
        return messages.finalResults;
    }
  },
  getStatusDescription: (project: IProjectData, phase?: IPhaseData) => {
    return (
      <FormattedMessage
        values={{
          b: (chunks) => (
            <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
          ),
          optionCount: phase
            ? phase.attributes.ideas_count
            : project.attributes.ideas_count,
          maxBudget: phase
            ? phase.attributes.max_budget
            : project.attributes.max_budget,
        }}
        {...messages.budgetingSubmissionInstructions}
      />
    );
  },
  getStatusSubmissionCountCopy: () => {
    return messages.submittedBudgetsCountText;
  },
  getSubmissionTerm: () => {
    return messages.budgets;
  },
};

// Get the configuration object for the given voting method
export function getVotingMethodConfig(
  votingMethod?: VotingMethod | null
): VotingMethodConfig | null {
  if (!votingMethod) return null;
  return methodToConfig[votingMethod];
}

// Map voting methods to voting method configs
const methodToConfig: {
  [method in VotingMethod]: VotingMethodConfig;
} = {
  budgeting: budgetingConfig,
};
