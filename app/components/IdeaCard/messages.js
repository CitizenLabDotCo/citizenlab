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
  byAuthorNameComponent: {
    id: 'app.components.IdeaCard.byAuthorNameComponent',
    defaultMessage: 'by {authorNameComponent}',
  },
  byDeletedUser: {
    id: 'app.components.IdeaCard.byDeletedUser',
    defaultMessage: 'by {deletedUser}',
  },
  deletedUser: {
    id: 'app.components.IdeaCard.deletedUser',
    defaultMessage: 'deleted user',
  },
  imageAltText: {
    id: 'app.components.IdeaCard.imageAltText',
    defaultMessage: '{orgName} - main image for the idea {ideaTitle}',
  },
  login: {
    id: 'app.components.IdeaCard.login',
    defaultMessage: 'Login',
  },
  register: {
    id: 'app.components.IdeaCard.register',
    defaultMessage: 'Create an account',
  },
  assign: {
    id: 'app.components.IdeaCard.assign',
    defaultMessage: 'Assign',
  },
  undo: {
    id: 'app.components.IdeaCard.undo',
    defaultMessage: 'Undo',
  },
  seeIdea: {
    id: 'app.components.IdeaCard.seeIdea',
    defaultMessage: 'See idea',
  },
});
