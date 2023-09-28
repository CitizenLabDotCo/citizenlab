import React from 'react';

// components
import AddToBasketButton from 'components/VoteInputs/budgeting/AddToBasketButton';
import AddToBasketBox from 'components/VoteInputs/budgeting/AddToBasketBox';
import AssignMultipleVotesInput from 'components/VoteInputs/multiple/AssignMultipleVotesInput';
import AssignMultipleVotesBox from 'components/VoteInputs/multiple/AssignMultipleVotesBox';
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';
import AssignSingleVoteBox from 'components/VoteInputs/single/AssignSingleVoteBox';

// i18n
import messages from './messages';
import { Localize } from 'hooks/useLocalize';
import { MessageDescriptor } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { toFullMonth } from 'utils/dateUtils';

// types
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { IAppConfiguration } from 'api/app_configuration/types';
import { VotingMethod } from 'utils/participationContexts';
import { FormatMessage } from 'typings';
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
  submissionState: VoteSubmissionState;
  phase?: IPhaseData;
  appConfig?: IAppConfiguration;
  localize: Localize;
  formatMessage: FormatMessage;
};

type IdeaCardVoteInputProps = {
  ideaId: string;
  participationContext: IPhaseData | IProjectData;
};

type IdeaPageVoteInputProps = IdeaCardVoteInputProps & {
  compact: boolean;
};

export type VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: (basketCount: number) => MessageDescriptor;
  getStatusDescription?: ({
    project,
    phase,
    submissionState,
    appConfig,
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getIdeaCardVoteInput: ({
    ideaId,
    participationContext,
  }: IdeaCardVoteInputProps) => JSX.Element | null;
  getIdeaPageVoteInput: ({
    ideaId,
    compact,
    participationContext,
  }: IdeaPageVoteInputProps) => JSX.Element | null;
  getSubmissionTerm: (form: 'singular' | 'plural') => MessageDescriptor;
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
    submissionState,
    appConfig,
  }: GetStatusDescriptionProps) => {
    const currency =
      appConfig?.data.attributes.settings.core.currency.toString();

    if (submissionState === 'hasNotSubmitted') {
      const participationContext = phase ?? project;
      const minBudget = participationContext.attributes.voting_min_total;

      return (
        <>
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              currency,
              optionCount: participationContext.attributes.ideas_count,
              maxBudget:
                participationContext.attributes.voting_max_total?.toLocaleString(),
            }}
            {...messages.budgetingSubmissionInstructionsTotalBudget}
          />
          <ul>
            <li>
              <FormattedMessage
                {...messages.budgetingSubmissionInstructionsPreferredOptions}
              />
            </li>
            {typeof minBudget === 'number' && minBudget > 0 ? (
              <li>
                <FormattedMessage
                  {...messages.budgetingSubmissionInstructionsMinBudget}
                  values={{
                    amount: minBudget,
                    currency,
                  }}
                />
              </li>
            ) : null}
            <li>
              <FormattedMessage
                {...messages.budgetingSubmissionInstructionsOnceYouAreDone}
              />
            </li>
          </ul>
        </>
      );
    }
    if (submissionState === 'hasSubmitted') {
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
    } else if (submissionState === 'submissionEnded') {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            maxBudget:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
            currency,
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
  getIdeaCardVoteInput: ({ ideaId, participationContext }) => (
    <AddToBasketButton
      ideaId={ideaId}
      participationContext={participationContext}
      buttonStyle="primary-outlined"
    />
  ),
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
          participationContext={participationContext}
          buttonStyle="primary"
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
    submissionState,
    localize,
    formatMessage,
  }: GetStatusDescriptionProps) => {
    const participationContext = phase || project;
    const voteTerm =
      localize(participationContext?.attributes?.voting_term_plural_multiloc) ||
      formatMessage(messages.votes).toLowerCase();

    if (submissionState === 'hasNotSubmitted') {
      return (
        <>
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              voteTerm,
              optionCount: participationContext.attributes.ideas_count,
              totalVotes:
                participationContext.attributes.voting_max_total?.toLocaleString(),
            }}
            {...messages.cumulativeVotingInstructionsTotalVotes}
          />
          <ul>
            <li>
              <FormattedMessage
                {...messages.cumulativeVotingInstructionsPreferredOptions}
              />
            </li>
            <li>
              <FormattedMessage
                {...messages.cumulativeVotingInstructionsMaxVotesPerIdea}
                values={{
                  maxVotes:
                    participationContext.attributes.voting_max_votes_per_idea,
                }}
              />
            </li>
            <li>
              <FormattedMessage
                {...messages.cumulativeVotingInstructionsOnceYouAreDone}
              />
            </li>
          </ul>
        </>
      );
    }
    if (submissionState === 'hasSubmitted') {
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
    } else if (submissionState === 'submissionEnded') {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: phase && toFullMonth(phase.attributes.end_at, 'day'),
            maxVotes:
              phase && phase.attributes.voting_max_total?.toLocaleString(),
            voteTerm,
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
  getIdeaCardVoteInput: ({ ideaId, participationContext }) => (
    <AssignMultipleVotesInput
      ideaId={ideaId}
      participationContext={participationContext}
    />
  ),
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
    submissionState,
  }: GetStatusDescriptionProps) => {
    const participationContext = phase || project;
    const totalVotes = participationContext?.attributes.voting_max_total;

    if (submissionState === 'hasNotSubmitted') {
      const youCanVoteMessage = totalVotes
        ? totalVotes > 1
          ? messages.singleVotingMultipleVotesYouCanVote
          : messages.singleVotingOneVoteYouCanVote
        : messages.singleVotingUnlimitedVotesYouCanVote;

      const preferredOptionMessage =
        totalVotes === 1
          ? messages.singleVotingPreferredOption
          : messages.singleVotingPreferredOptions;

      return (
        <>
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              totalVotes: participationContext?.attributes.voting_max_total,
            }}
            {...youCanVoteMessage}
          />
          <ul>
            <li>
              <FormattedMessage {...preferredOptionMessage} />
            </li>
            <li>
              <FormattedMessage {...messages.singleVotingOnceYouAreDone} />
            </li>
          </ul>
        </>
      );
    }
    if (submissionState === 'hasSubmitted') {
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
    } else if (submissionState === 'submissionEnded') {
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
  getIdeaCardVoteInput: ({ ideaId, participationContext }) => (
    <AssignSingleVoteButton
      ideaId={ideaId}
      participationContext={participationContext}
      buttonStyle="primary-outlined"
    />
  ),
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
