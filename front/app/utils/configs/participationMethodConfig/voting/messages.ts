import { defineMessages } from 'react-intl';

export default defineMessages({
  // Defaults
  votingNotSignedIn: {
    id: 'app.utils.participationMethodConfig.voting.votingNotSignedIn',
    defaultMessage: 'You must login or register to vote.',
  },
  votingNotPermitted: {
    id: 'app.utils.participationMethodConfig.voting.votingNotPermitted',
    defaultMessage: 'You are not permitted to vote.',
  },
  votingNotInGroup: {
    id: 'app.utils.participationMethodConfig.voting.votingNotInGroup',
    defaultMessage: 'You do not meet the requirements to vote.',
  },
});
