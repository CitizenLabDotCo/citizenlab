import { defineMessages } from 'react-intl';

export default defineMessages({
  budgetExceededError: {
    id: 'app.components.ErrorToast.budgetExceededError',
    defaultMessage: "You don't have enough budget",
  },
  votesExceededError: {
    id: 'app.components.ErrorToast.votesExceededError',
    defaultMessage: "You don't have enough votes left",
  },
});
