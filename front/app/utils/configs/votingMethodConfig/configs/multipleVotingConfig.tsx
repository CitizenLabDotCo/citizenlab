import React from 'react';

import { getPhaseVoteTermMessage } from 'api/phases/utils';

import AssignMultipleVotesBox from 'components/VoteInputs/multiple/AssignMultipleVotesBox';
import AssignMultipleVotesInput from 'components/VoteInputs/multiple/AssignMultipleVotesInput';

import { FormattedMessage } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';

import messages from '../messages';
import {
  GetStatusDescriptionProps,
  VoteSubmissionState,
  VotingMethodConfig,
} from '../types';

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
  }: GetStatusDescriptionProps) => {
    if (!phase) return null;

    const minimumSelectedOptions = phase.attributes.voting_min_selected_options;

    const cumulativeVotingInstructionsTotalVotesMessage =
      getPhaseVoteTermMessage(phase, {
        vote: messages.cumulativeVotingInstructionsTotalVotes,
        point: messages.cumulativeVotingInstructionsTotalPoints,
        token: messages.cumulativeVotingInstructionsTotalTokens,
        credit: messages.cumulativeVotingInstructionsTotalCredits,
        percent: messages.cumulativeVotingInstructionsTotalPercents,
      });

    const cumulativeVotingInstructionsMaxVotesPerIdeaMessage =
      getPhaseVoteTermMessage(phase, {
        vote: messages.cumulativeVotingInstructionsMaxVotesPerIdea,
        point: messages.cumulativeVotingInstructionsMaxPointsPerIdea,
        token: messages.cumulativeVotingInstructionsMaxTokensPerIdea,
        credit: messages.cumulativeVotingInstructionsMaxCreditsPerIdea,
        percent: messages.cumulativeVotingInstructionsMaxPercentsPerIdea,
      });
    if (submissionState === 'hasNotSubmitted') {
      return (
        <>
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              optionCount: phase.attributes.ideas_count,
              totalVotes: phase.attributes.voting_max_total?.toLocaleString(),
            }}
            {...cumulativeVotingInstructionsTotalVotesMessage}
          />
          {minimumSelectedOptions && minimumSelectedOptions > 1 && (
            <>
              {' '}
              <FormattedMessage
                values={{
                  b: (chunks) => (
                    <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                  ),
                  minSelectedOptions: minimumSelectedOptions,
                }}
                {...messages.minSelectedOptionsMessage}
              />
            </>
          )}
          <ul>
            <li>
              <FormattedMessage
                {...messages.cumulativeVotingInstructionsPreferredOptions}
              />
            </li>
            <li>
              <FormattedMessage
                {...cumulativeVotingInstructionsMaxVotesPerIdeaMessage}
                values={{
                  maxVotes: phase.attributes.voting_max_votes_per_idea,
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
      if (phase.attributes.end_at) {
        return (
          <FormattedMessage
            values={{
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
              endDate: getLocalisedDateString(phase.attributes.end_at),
            }}
            {...messages.votingSubmittedInstructions}
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
            {...messages.votingSubmittedInstructionsNoEndDate}
          />
        );
      }
    } else if (phase.attributes.end_at) {
      return (
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
            endDate: getLocalisedDateString(phase.attributes.end_at),
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

export default multipleVotingConfig;
