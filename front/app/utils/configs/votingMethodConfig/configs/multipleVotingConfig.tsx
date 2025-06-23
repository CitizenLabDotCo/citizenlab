import React from 'react';

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
  // To change
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

export default multipleVotingConfig;
