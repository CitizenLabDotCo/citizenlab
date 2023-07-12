import React from 'react';

// components
import AddToBasketButton from 'components/VoteInputs/budgeting/AddToBasketButton';
import AddToBasketBox from 'components/VoteInputs/budgeting/AddToBasketBox';
import AssignMultipleVotesInput from 'components/VoteInputs/multiple/AssignMultipleVotesInput';
import AssignMultipleVotesBox from 'components/VoteInputs/multiple/AssignMultipleVotesBox';
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';
import AssignSingleVoteBox from 'components/VoteInputs/single/AssignSingleVoteBox';

// intl
import messages from './messages';
import { MessageDescriptor } from 'react-intl';
import { Locale } from '@citizenlab/cl2-component-library';

// utils
import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// types
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { IAppConfiguration } from 'api/app_configuration/types';
import { VotingMethod } from 'services/participationContexts';
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
  - getIdeaPageVoteInput: Returns the vote input to be displayed on the idea page
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
  locale?: Locale | null | Error;
};

export type VoteInputProps = {
  ideaId: string;
  compact: boolean;
  participationContext: IPhaseData | IProjectData;
};

export type VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: (basketCount: number) => MessageDescriptor;
  getStatusDescription?: ({
    project,
    phase,
    SubmissionState,
    appConfig,
    locale,
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getIdeaPageVoteInput?: ({
    ideaId,
    compact,
    participationContext,
  }: VoteInputProps) => JSX.Element | null;
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
  getIdeaPageVoteInput: ({ ideaId, participationContext, compact }) => {
    if (!compact) {
      return (
        <AddToBasketBox
          ideaId={ideaId}
          participationContext={participationContext}
        />
      );
    } else {
      return (
        <AddToBasketButton
          ideaId={ideaId}
          buttonStyle="primary-outlined"
          participationContext={participationContext}
        />
      );
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
    locale,
  }: GetStatusDescriptionProps) => {
    const participationContext = phase || project;
    const voteTerm =
      participationContext?.attributes?.voting_term_plural_multiloc;

    if (SubmissionState === 'hasNotSubmitted') {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            voteTerm: voteTerm && !isNilOrError(locale) ? voteTerm[locale] : '',
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
    } else if (SubmissionState === 'submissionEnded' && !isNilOrError(locale)) {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            maxVotes:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
            voteTerm:
              participationContext?.attributes.voting_term_plural_multiloc?.[
                locale
              ] || 'votes',
            optionCount: phase && phase.attributes.ideas_count,
          }}
          {...messages.multipleVotingEnded}
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
  getIdeaPageVoteInput: ({ ideaId, participationContext, compact }) => {
    if (!compact) {
      return (
        <AssignMultipleVotesBox
          ideaId={ideaId}
          participationContext={participationContext}
        />
      );
    }
    return (
      <AssignMultipleVotesInput
        ideaId={ideaId}
        participationContext={participationContext}
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
    locale,
  }: GetStatusDescriptionProps) => {
    const participationContext = phase || project;
    const totalVotes = participationContext?.attributes.voting_max_total;

    if (SubmissionState === 'hasNotSubmitted') {
      if (totalVotes) {
        if (totalVotes > 1) {
          return (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                totalVotes: participationContext?.attributes.voting_max_total,
              }}
              {...messages.singleVotingMultipleVotesInstructions}
            />
          );
        }
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              totalVotes: participationContext?.attributes.voting_max_total,
            }}
            {...messages.singleVotingOneVoteInstructions}
          />
        );
      }
      return (
        <FormattedMessage {...messages.singleVotingInstructionsUnlimited} />
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
    } else if (SubmissionState === 'submissionEnded' && !isNilOrError(locale)) {
      const votingMax = phase?.attributes?.voting_max_total;
      if (votingMax) {
        if (votingMax > 1) {
          return (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
                maxVotes: votingMax?.toLocaleString(),
                optionCount: phase && phase.attributes.ideas_count,
              }}
              {...messages.singleVotingEnded}
            />
          );
        } else {
          return (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
                maxVotes: votingMax?.toLocaleString(),
                optionCount: phase && phase.attributes.ideas_count,
              }}
              {...messages.singleVotingOneVoteEnded}
            />
          );
        }
      } else {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            }}
            {...messages.singleVotingUnlimitedEnded}
          />
        );
      }
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
  getIdeaPageVoteInput: ({ ideaId, participationContext, compact }) => {
    if (!compact) {
      return (
        <AssignSingleVoteBox
          ideaId={ideaId}
          participationContext={participationContext}
        />
      );
    }

    return (
      <AssignSingleVoteButton
        ideaId={ideaId}
        participationContext={participationContext}
        buttonStyle="primary"
      />
    );
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
