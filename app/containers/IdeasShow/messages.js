/*
 * IdeasShow Messages
 *
 * This contains all the text for the IdeasShow component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loadVotesError: {
    id: 'app.containers.IdeasShow.loadVotesError',
    defaultMessage: 'Voting is not currently available',
  },
  ideaVoteSubmitError: {
    id: 'app.containers.IdeasShow.ideaVoteSubmitError',
    defaultMessage: 'Voting failed',
  },
});
