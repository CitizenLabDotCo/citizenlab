import { defineMessages } from 'react-intl';

export default defineMessages({
  sorryNoAccess: {
    id: 'app.components.IdeasShowPage.sorryNoAccess',
    defaultMessage:
      "Sorry, you can't access this page. You may need to log in or sign up to access it.",
  },
  signUp: {
    id: 'app.components.IdeasShowPage.signUp',
    defaultMessage: 'Sign Up',
  },
  signIn: {
    id: 'app.components.IdeasShowPage.signIn',
    defaultMessage: 'Log in if you already have an account',
  },
  noPermission: {
    id: 'app.components.Unauthorized.noPermission',
    defaultMessage: "You don't have permission to view this page",
  },
  notAuthorized: {
    id: 'app.components.Unauthorized.notAuthorized',
    defaultMessage: "Sorry, you're not authorized to access this page.",
  },
});
