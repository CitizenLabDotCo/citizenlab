import React from 'react';

import AssignSingleVoteBox from 'components/VoteInputs/single/AssignSingleVoteBox';
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';

import { FormattedMessage } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';

import messages from '../messages';
import {
  GetStatusDescriptionProps,
  VoteSubmissionState,
  VotingMethodConfig,
} from '../types';

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

export default singleVotingConfig;
