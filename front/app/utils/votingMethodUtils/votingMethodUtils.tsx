import React from 'react';

// types
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { IAppConfiguration } from 'api/app_configuration/types';

// api
import { VotingMethod } from 'services/participationContexts';

// intl
import messages from './messages';
import { MessageDescriptor } from 'react-intl';

// utils
import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

// components
import AssignVotesControl from 'containers/IdeasShow/components/RightColumnDesktop/AssignVotesControl';
import AssignBudgetControl from 'containers/IdeasShow/components/RightColumnDesktop/AssignBudgetControl';
import AddToBasketButton from 'components/AddToBasketButton';
import AssignMultipleVotesControl from 'components/AssignMultipleVotesControl';

/*
  Configuration Specifications
  
  StatusModule:
  - getStatusHeader: Returns header which appears directly above status module
  - getStatusTitle: Returns title for the status module
  - getStatusDescription: Returns description for the status module
  - getStatusSubmissionCountCopy: Returns copy related to the submission count
  - getSubmissionTerm: Returns the submission type in specified form (i.e. singular vs plural)
  - preSubmissionWarning: Returns warning to be displayed before submission is made
  - useVoteTerm: Returns whether the custom vote term should be used in front office
  - getIdeaPageVoteControl: Returns the vote control to be displayed on the idea page
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

export type VoteControlProps = {
  ideaId: string;
  projectId: string;
  view: 'mobile' | 'desktop';
};

export type VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: (basketCount: number) => MessageDescriptor;
  getStatusDescription?: ({
    project,
    phase,
    SubmissionState,
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getIdeaPageVoteControl?: ({
    ideaId,
    projectId,
    view,
  }: VoteControlProps) => JSX.Element | null;
  getSubmissionTerm?: (form: 'singular' | 'plural') => MessageDescriptor;
  preSubmissionWarning: () => MessageDescriptor;
  useVoteTerm: boolean;
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
        return messages.budgetSubmittedWithIcon;
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
            currency: appConfig?.data.attributes.settings.core.currency,
            optionCount: phase
              ? phase.attributes.ideas_count
              : project.attributes.ideas_count,
            maxBudget: phase
              ? phase.attributes.voting_max_total?.toLocaleString()
              : project.attributes.voting_max_total?.toLocaleString(),
          }}
          {...messages.budgetingSubmissionInstructions}
        />
      );
    }
    if (SubmissionState === 'hasSubmitted') {
      if (phase) {
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
      }
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
          }}
          {...messages.budgetingSubmittedInstructionsContinuous}
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
            maxBudget:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
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
  getStatusSubmissionCountCopy: (basketCount) => {
    if (basketCount > 1) {
      return messages.submittedBudgetsCountText;
    }
    return messages.submittedBudgetCountText;
  },
  getSubmissionTerm: (form) => {
    if (form === 'singular') {
      return messages.budget;
    }
    return messages.budgets;
  },
  preSubmissionWarning: () => {
    return messages.budgetingPreSubmissionWarning;
  },
  getIdeaPageVoteControl: ({ ideaId, projectId, view }) => {
    if (view === 'desktop') {
      return <AssignBudgetControl ideaId={ideaId} projectId={projectId} />;
    } else {
      return <AddToBasketButton ideaId={ideaId} projectId={projectId} />;
    }
  },
  useVoteTerm: false,
};

const multipleVotingConfig: VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.castYourVote;
      case 'hasSubmitted':
        return messages.votesCast;
      case 'submissionEnded':
        return messages.votingClosed;
    }
  },
  getStatusTitle: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.howToVote;
      case 'hasSubmitted':
        return messages.voteSubmittedWithIcon;
      case 'submissionEnded':
        return messages.finalTally;
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
            voteTerm: 'votes', // TODO: Replace with voting term from attributes
            optionCount: phase
              ? phase.attributes.ideas_count
              : project.attributes.ideas_count,
            totalVotes: phase
              ? phase.attributes.voting_max_total?.toLocaleString()
              : project.attributes.voting_max_total?.toLocaleString(),
          }}
          {...messages.cumulativeVotingInstructions}
        />
      );
    }
    if (SubmissionState === 'hasSubmitted') {
      if (phase) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            }}
            {...messages.votingSubmittedInstructions}
          />
        );
      }
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
          }}
          {...messages.votingSubmittedInstructionsContinuous}
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
            maxBudget:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
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
  getStatusSubmissionCountCopy: (basketCount) => {
    if (basketCount > 1) {
      return messages.submittedVotesCountText;
    } else {
      return messages.submittedVoteCountText;
    }
  },
  getSubmissionTerm: (form) => {
    if (form === 'singular') {
      return messages.vote;
    }
    return messages.votes;
  },
  preSubmissionWarning: () => {
    return messages.votingPreSubmissionWarning;
  },
  getIdeaPageVoteControl: ({ ideaId, projectId, view }) => {
    if (view === 'desktop') {
      return <AssignVotesControl ideaId={ideaId} projectId={projectId} />;
    }
    return (
      <AssignMultipleVotesControl
        ideaId={ideaId}
        projectId={projectId}
        fillWidth={true}
      />
    );
  },
  useVoteTerm: true,
};

const singleVotingConfig: VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.castYourVote;
      case 'hasSubmitted':
        return messages.votesCast;
      case 'submissionEnded':
        return messages.votingClosed;
    }
  },
  getStatusTitle: (submissionState: VoteSubmissionState) => {
    switch (submissionState) {
      case 'hasNotSubmitted':
        return messages.howToVote;
      case 'hasSubmitted':
        return messages.voteSubmittedWithIcon;
      case 'submissionEnded':
        return messages.finalTally;
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
            totalVotes: phase
              ? phase.attributes.voting_max_total?.toLocaleString()
              : project.attributes.voting_max_total?.toLocaleString(),
          }}
          {...messages.cumulativeVotingInstructions}
        />
      );
    }
    if (SubmissionState === 'hasSubmitted') {
      if (phase) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            }}
            {...messages.votingSubmittedInstructions}
          />
        );
      }
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
          }}
          {...messages.votingSubmittedInstructionsContinuous}
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
            maxBudget:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
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
  getStatusSubmissionCountCopy: (basketCount) => {
    if (basketCount > 1) {
      return messages.submittedVotesCountText;
    } else {
      return messages.submittedVoteCountText;
    }
  },
  getSubmissionTerm: (form) => {
    if (form === 'singular') {
      return messages.vote;
    }
    return messages.votes;
  },
  preSubmissionWarning: () => {
    return messages.votingPreSubmissionWarning;
  },
  useVoteTerm: false,
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
  multiple_voting: multipleVotingConfig,
  single_voting: singleVotingConfig,
};
