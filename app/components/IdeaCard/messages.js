/*
 * IdeaCard Messages
 *
 * This contains all the text for the IdeaCard component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  byAuthorName: {
    id: 'app.components.IdeaCard.byAuthorName',
    defaultMessage: 'by {authorName}',
  },
  byDeletedUser: {
    id: 'app.components.IdeaCard.byDeletedUser',
    defaultMessage: 'by {deletedUser}',
  },
  deletedUser: {
    id: 'app.components.IdeaCard.deletedUser',
    defaultMessage: 'deleted user',
  },
  login: {
    id: 'app.components.IdeaCard.login',
    defaultMessage: 'Login',
  },
  register: {
    id: 'app.components.IdeaCard.register',
    defaultMessage: 'Create an account',
  },
  votingDisabledProjectInactive: {
    id: 'app.components.IdeaCard.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer vote on ideas in {projectName}',
  },
  votingDisabledNotInActiveContext: {
    id: 'app.components.IdeaCard.votingDisabledNotInActiveContext',
    defaultMessage: 'This idea is no longer, or not yet in the running in {projectName}',
  },
  votingDisabledPossibleLater: {
    id: 'app.components.IdeaCard.votingDisabledPossibleLater',
    defaultMessage: 'Voting on ideas in {projectName} will be possible from {enabledFromDate}',
  },
  votingDisabledForProject: {
    id: 'app.components.IdeaCard.votingDisabledForProject',
    defaultMessage: 'Voting on ideas in {projectName} is not possible',
  },
  votingDisabledMaxReached: {
    id: 'app.components.IdeaCard.votingDisabledMaxReached',
    defaultMessage: 'You\'ve reached your maximum number of votes in {projectName}',
  },
});
