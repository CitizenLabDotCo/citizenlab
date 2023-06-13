import { VotingMethod } from 'services/participationContexts';
import messages from './messages';
import { MessageDescriptor } from 'react-intl';
import React from 'react';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';
import { IAppConfiguration } from 'api/app_configuration/types';

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

export type GetStatusDescriptionProps = {
  project: IProjectData;
  SubmissionState: VoteSubmissionState;
  phase?: IPhaseData;
  appConfig?: IAppConfiguration;
};

export type VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: () => MessageDescriptor;
  getStatusDescription?: ({
    project,
    phase,
    SubmissionState,
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getSubmissionTerm?: (form: 'singular' | 'plural') => MessageDescriptor;
};

const budgetingConfig: VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.submitYourBudget;
      case 'hasSubmitted':
        return messages.budgetSubmitted;
      case 'submissionEnded':
        return messages.results;
    }
  },
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
  getStatusDescription: ({
    project,
    phase,
    SubmissionState,
    appConfig,
  }: GetStatusDescriptionProps) => {
    if (SubmissionState === 'hasNotSubmitted') {
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
    }
    if (SubmissionState === 'hasSubmitted') {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
          }}
          {...messages.budgetingSubmittedInstructions}
        />
      );
    } else if (SubmissionState === 'submissionEnded') {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            maxBudget: phase && phase.attributes.max_budget,
            currency:
              appConfig?.data.attributes.settings.core.currency.toString(),
            optionCount: phase && phase.attributes.ideas_count,
          }}
          {...messages.budgetParticipationEnded}
        />
      );
    }
    return null;
  },
  getStatusSubmissionCountCopy: () => {
    return messages.submittedBudgetsCountText;
  },
  getSubmissionTerm: (form) => {
    if (form === 'singular') {
      return messages.budget;
    }
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
