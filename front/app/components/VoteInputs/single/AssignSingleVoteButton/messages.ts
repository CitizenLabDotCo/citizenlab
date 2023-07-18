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
});
