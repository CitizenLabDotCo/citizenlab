import { defineMessages } from 'react-intl';

export default defineMessages({
  vote: {
    id: 'app.components.AssignVoteControl.vote',
    defaultMessage: 'Vote',
  },
  voted: {
    id: 'app.components.AssignVoteControl.voted',
    defaultMessage: 'Voted',
  },
  votesSubmitted: {
    id: 'app.components.AssignVoteControl.votesSubmitted',
    defaultMessage:
      'You have already submitted your {votes, plural, one {vote} other {votes}}. Click "Modify your vote" to change your {votes, plural, one {vote} other {votes}}.',
  },
  votesSubmittedIdeaPage: {
    id: 'app.components.AssignVoteControl.votesSubmittedIdeaPage',
    defaultMessage:
      'You have already submitted your {votes, plural, one {vote} other {votes}}. To change your {votes, plural, one {vote} other {votes}}, go back to the project page and click "Modify your vote".',
  },
});
