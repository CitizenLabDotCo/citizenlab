import { defineMessages } from 'react-intl';

export default defineMessages({
  theVotesAssociated: {
    id: 'app.components.admin.PostManager.components.PostTable.Row.theVotesAssociated',
    defaultMessage: 'The votes associated with this idea will be lost',
  },
  youAreTrying: {
    id: 'app.components.admin.PostManager.components.PostTable.Row.theIdeaYouAreMoving',
    defaultMessage:
      'You are trying to remove this idea from a phase where it has received votes. If you do this, these votes will be lost. Are you sure you want to remove this idea from this phase?',
  },
  removeTopic: {
    id: 'app.components.admin.PostManager.components.PostTable.Row.removeTopic',
    defaultMessage: 'Remove topic',
  },
});
