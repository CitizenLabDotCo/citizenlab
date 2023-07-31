import { defineMessages } from 'react-intl';

export default defineMessages({
  youHave: {
    id: 'app.components.AssignVoteControl.youHave',
    defaultMessage: 'You have',
  },
  a11y_price: {
    id: 'app.components.AssignBudgetControl.a11y_price',
    defaultMessage: 'Price: ',
  },
  haveVotedFor: {
    id: 'app.components.AssignVoteControl.haveVotedFor',
    defaultMessage: 'You have voted for ',
  },
  xOptions: {
    id: 'app.components.AssignVoteControl.xOptions',
    defaultMessage: '{votes, plural, one {option} other {options}}',
  },
  voteForAtLeastOne: {
    id: 'app.components.AssignVoteControl.voteForAtLeastOne',
    defaultMessage: 'Vote for at least 1 option',
  },
});
