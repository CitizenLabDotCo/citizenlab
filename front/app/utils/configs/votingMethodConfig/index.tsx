import React from 'react';

import { MessageDescriptor } from 'react-intl';
import { FormatMessage } from 'typings';

import { IPhaseData, VotingMethod } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { Localize } from 'hooks/useLocalize';

import AddToBasketBox from 'components/VoteInputs/budgeting/AddToBasketBox';
import AddToBasketButton from 'components/VoteInputs/budgeting/AddToBasketButton';
import AssignMultipleVotesBox from 'components/VoteInputs/multiple/AssignMultipleVotesBox';
import AssignMultipleVotesInput from 'components/VoteInputs/multiple/AssignMultipleVotesInput';
import AssignSingleVoteBox from 'components/VoteInputs/single/AssignSingleVoteBox';
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';

import { FormattedMessage } from 'utils/cl-intl';
import { UseFormatCurrencyReturn } from 'utils/currency/useFormatCurrency';
import { getLocalisedDateString } from 'utils/dateUtils';

import messages from './messages';

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
  localize: Localize;
  formatMessage: FormatMessage;
  formatCurrency: UseFormatCurrencyReturn;
};

type IdeaCardVoteInputProps = {
  ideaId: string;
  phase: IPhaseData;
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
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getIdeaCardVoteInput: ({
    ideaId,
    phase,
  }: IdeaCardVoteInputProps) => JSX.Element | null;
  getIdeaPageVoteInput: ({
    ideaId,
    compact,
    phase,
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
    phase,
    submissionState,
    formatCurrency,
  }: GetStatusDescriptionProps) => {
    if (!phase) return null;

    if (submissionState === 'hasNotSubmitted') {
      const minBudget = phase.attributes.voting_min_total;
      const maxBudget = phase.attributes.voting_max_total;
      const optionCount = phase.attributes.ideas_count;

      return (
        <>
          {typeof maxBudget === 'number' && (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                optionCount,
                maxBudget: formatCurrency(maxBudget),
              }}
              {...messages.budgetingSubmissionInstructionsTotalBudget2}
            />
          )}
          <ul>
            <li>
              <FormattedMessage
                {...messages.budgetingSubmissionInstructionsPreferredOptions}
              />
            </li>
            {typeof minBudget === 'number' && minBudget > 0 ? (
              <li>
                <FormattedMessage
                  {...messages.budgetingSubmissionInstructionsMinBudget1}
                  values={{
                    amount: formatCurrency(minBudget),
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (phase?.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              endDate: getLocalisedDateString(phase?.attributes.end_at),
            }}
            {...messages.budgetingSubmittedInstructions}
          />
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (phase && !phase.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
            }}
            {...messages.budgetingSubmittedInstructionsNoEndDate}
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
    } else if (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      submissionState === 'submissionEnded' &&
      typeof phase.attributes.voting_max_total === 'number'
    ) {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            endDate: getLocalisedDateString(phase?.attributes.end_at),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            maxBudget: formatCurrency(phase.attributes.voting_max_total),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            optionCount: phase?.attributes.ideas_count,
          }}
          {...messages.budgetParticipationEnded1}
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
  getIdeaCardVoteInput: ({ ideaId, phase }) => (
    <AddToBasketButton
      ideaId={ideaId}
      phase={phase}
      buttonStyle="primary-outlined"
    />
  ),
  getIdeaPageVoteInput: ({ ideaId, phase, compact }) => {
    if (!compact) {
      return <AddToBasketBox ideaId={ideaId} phase={phase} />;
    } else {
      return (
        <AddToBasketButton
          ideaId={ideaId}
          phase={phase}
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
    phase,
    submissionState,
    localize,
    formatMessage,
  }: GetStatusDescriptionProps) => {
    const fallbackVoteTerm = formatMessage(messages.vote).toLowerCase();
    const fallbackVotesTerm = formatMessage(messages.votes).toLowerCase();

    const voteTerm =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      localize(phase?.attributes?.voting_term_singular_multiloc) ??
      fallbackVoteTerm;
    const votesTerm =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      localize(phase?.attributes?.voting_term_plural_multiloc) ??
      fallbackVotesTerm;

    const maxVotesTerm =
      phase?.attributes.voting_max_total === 1 ? voteTerm : votesTerm;
    const maxVotesPerIdeaTerm =
      phase?.attributes.voting_max_votes_per_idea === 1 ? voteTerm : votesTerm;

    if (!phase) return null;

    if (submissionState === 'hasNotSubmitted') {
      return (
        <>
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              voteTerm: maxVotesTerm,
              optionCount: phase.attributes.ideas_count,
              totalVotes: phase.attributes.voting_max_total?.toLocaleString(),
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
                  maxVotes: phase.attributes.voting_max_votes_per_idea,
                  voteTerm: maxVotesPerIdeaTerm,
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (phase?.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              endDate: getLocalisedDateString(phase?.attributes.end_at),
            }}
            {...messages.votingSubmittedInstructions}
          />
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (phase) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
            }}
            {...messages.votingSubmittedInstructionsNoEndDate}
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
    } else if (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      submissionState === 'submissionEnded' && // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      phase?.attributes.end_at
    ) {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            endDate: getLocalisedDateString(phase?.attributes.end_at),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            maxVotes: phase?.attributes.voting_max_total?.toLocaleString(),
            voteTerm: maxVotesTerm,
            optionCount: phase.attributes.ideas_count,
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
  getIdeaCardVoteInput: ({ ideaId, phase }) => (
    <AssignMultipleVotesInput ideaId={ideaId} phase={phase} />
  ),
  getIdeaPageVoteInput: ({ ideaId, phase, compact }) => {
    if (!compact) {
      return <AssignMultipleVotesBox ideaId={ideaId} phase={phase} />;
    }
    return (
      <AssignMultipleVotesInput
        ideaId={ideaId}
        phase={phase}
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
    phase,
    submissionState,
  }: GetStatusDescriptionProps) => {
    const totalVotes = phase?.attributes.voting_max_total;

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
              totalVotes: phase?.attributes.voting_max_total,
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
      if (phase?.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              endDate: getLocalisedDateString(phase?.attributes.end_at),
            }}
            {...messages.votingSubmittedInstructions}
          />
        );
      } else if (phase && !phase.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
            }}
            {...messages.votingSubmittedInstructionsNoEndDate}
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (submissionState === 'submissionEnded') {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const votingMax = phase?.attributes?.voting_max_total;
      if (votingMax) {
        if (votingMax > 1 && phase.attributes.end_at) {
          return (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                endDate: getLocalisedDateString(phase?.attributes.end_at),
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                maxVotes: votingMax?.toLocaleString(),
                optionCount: phase.attributes.ideas_count,
              }}
              {...messages.singleVotingEnded}
            />
          );
        } else if (phase.attributes.end_at) {
          return (
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                endDate: getLocalisedDateString(phase?.attributes.end_at),
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                maxVotes: votingMax?.toLocaleString(),
                optionCount: phase.attributes.ideas_count,
              }}
              {...messages.singleVotingOneVoteEnded}
            />
          );
        } else {
          return null;
        }
      } else if (phase?.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              endDate: getLocalisedDateString(phase?.attributes.end_at),
            }}
            {...messages.singleVotingUnlimitedEnded}
          />
        );
      } else {
        return null;
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
  getIdeaCardVoteInput: ({ ideaId, phase }) => (
    <AssignSingleVoteButton
      ideaId={ideaId}
      phase={phase}
      buttonStyle="primary-outlined"
    />
  ),
  getIdeaPageVoteInput: ({ ideaId, phase, compact }) => {
    if (!compact) {
      return <AssignSingleVoteBox ideaId={ideaId} phase={phase} />;
    }

    return (
      <AssignSingleVoteButton
        ideaId={ideaId}
        phase={phase}
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
