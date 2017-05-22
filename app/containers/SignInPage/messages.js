/*
 * SignInPage Messages
 *
 * This contains all the text for the SignInPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.SignInPage.header',
    defaultMessage: 'SignInPage',
  },
  authErrorInvalid: {
    id: 'app.containers.SignInPage.authErrorInvalid',
    defaultMessage: 'Password o Email Invalid',
  },

  buttonSignIn: {
    id: 'app.containers.SignInPage.buttonSignIn',
    defaultMessage: 'Sign In',
  },
  noAccountYet: {
    id: 'app.containers.SignInPage.noAccountYet',
    defaultMessage: 'New here?',
  },
  signUpNow: {
    id: 'app.containers.SignInPage.signUpNow',
    defaultMessage: 'Sign Up Now!',
  },
  facebookSignIn: {
    id: 'app.containers.SignInPage.facebookSignIn',
    defaultMessage: 'Sign In With Facebook',
  },
});
