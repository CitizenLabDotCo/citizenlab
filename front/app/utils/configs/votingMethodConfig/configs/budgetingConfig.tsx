import React from 'react';

import AddToBasketBox from 'components/VoteInputs/budgeting/AddToBasketBox';
import AddToBasketButton from 'components/VoteInputs/budgeting/AddToBasketButton';

import { FormattedMessage } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';

import messages from '../messages';
import {
  GetStatusDescriptionProps,
  VoteSubmissionState,
  VotingMethodConfig,
} from '../types';

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
      if (phase.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              endDate: getLocalisedDateString(phase.attributes.end_at),
            }}
            {...messages.budgetingSubmittedInstructions}
          />
        );
      } else {
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
            endDate: getLocalisedDateString(phase.attributes.end_at),
            maxBudget: formatCurrency(phase.attributes.voting_max_total),
            optionCount: phase.attributes.ideas_count,
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

export default budgetingConfig;
