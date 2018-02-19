/*
 * UsersEditPage Messages
 *
 * This contains all the text for the UsersEditPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.UsersEditPage.helmetTitle',
    defaultMessage: 'User edit page',
  },
  helmetDescription: {
    id: 'app.containers.UsersEditPage.helmetDescription',
    defaultMessage: 'Edit user profile',
  },
  loading: {
    id: 'app.containers.UsersEditPage.loading',
    defaultMessage: 'Loading...',
  },
  loadError: {
    id: 'app.containers.UsersEditPage.loadError',
    defaultMessage: 'Can\'t load existing profile',
  },
  processing: {
    id: 'app.containers.UsersEditPage.processing',
    defaultMessage: 'Sending...',
  },
  buttonErrorLabel: {
    id: 'app.containers.UsersEditPage.buttonErrorLabel',
    defaultMessage: 'Error',
  },
  buttonSuccessLabel: {
    id: 'app.containers.UsersEditPage.buttonSuccessLabel',
    defaultMessage: 'Success',
  },
  messageError: {
    id: 'app.containers.UsersEditPage.messageError',
    defaultMessage: 'There was an error saving your profile.',
  },
  messageSuccess: {
    id: 'app.containers.UsersEditPage.messageSuccess',
    defaultMessage: 'Your profile has been saved.',
  },
  storeError: {
    id: 'app.containers.UsersEditPage.storeError',
    defaultMessage: 'Can\'t store updated profile',
  },
  stored: {
    id: 'app.containers.UsersEditPage.stored',
    defaultMessage: 'Profile stored',
  },
  /*
   * Basic information
  */
  h1: {
    id: 'app.containers.UsersEditPage.h1',
    defaultMessage: 'Basic information',
  },
  h1sub: {
    id: 'app.containers.UsersEditPage.h1sub',
    defaultMessage: 'Edit your basic information related to your account',
  },
  avatarUploadError: {
    id: 'app.containers.UsersEditPage.avatarUploadError',
    defaultMessage: 'Avatar upload failed',
  },
  firstName: {
    id: 'app.containers.UsersEditPage.firstName',
    defaultMessage: 'First name',
  },
  lastName: {
    id: 'app.containers.UsersEditPage.lastName',
    defaultMessage: 'Last name',
  },
  email: {
    id: 'app.containers.UsersEditPage.email',
    defaultMessage: 'E-mail address',
  },
  password: {
    id: 'app.containers.UsersEditPage.password',
    defaultMessage: 'Password',
  },
  language: {
    id: 'app.containers.UsersEditPage.language',
    defaultMessage: 'Language',
  },
  /*
   * Details
   */
  h2: {
    id: 'app.containers.UsersEditPage.h2',
    defaultMessage: 'Details',
  },
  h2sub: {
    id: 'app.containers.UsersEditPage.h2sub',
    defaultMessage: 'All information is private and help us to know you better',
  },
  gender: {
    id: 'app.containers.UsersEditPage.gender',
    defaultMessage: 'Gender',
  },
  male: {
    id: 'app.containers.UsersEditPage.male',
    defaultMessage: 'Male',
  },
  female: {
    id: 'app.containers.UsersEditPage.female',
    defaultMessage: 'Female',
  },
  unspecified: {
    id: 'app.containers.UsersEditPage.unspecified',
    defaultMessage: 'Unspecified',
  },
  bio: {
    id: 'app.containers.UsersEditPage.bio',
    defaultMessage: 'Bio',
  },
  bio_placeholder: {
    id: 'app.containers.UsersEditPage.bio_placeholder',
    defaultMessage: 'Write a short description of yourself',
  },
  domicile: {
    id: 'app.containers.UsersEditPage.domicile',
    defaultMessage: 'Domicile',
  },
  domicile_placeholder: {
    id: 'app.containers.UsersEditPage.domicile_placeholder',
    defaultMessage: 'Domicile',
  },
  outside: {
    id: 'app.containers.UsersEditPage.outside',
    defaultMessage: `{orgType, select,
      city {Outside of {name}}
      generic {None of these}
    }`,
  },
  birthdate: {
    id: 'app.containers.UsersEditPage.birthdate',
    defaultMessage: 'Date of Birth',
  },
  education: {
    id: 'app.containers.UsersEditPage.education',
    defaultMessage: 'Highest diploma',
  },
  education_placeholder: {
    id: 'app.containers.UsersEditPage.education_placeholder',
    defaultMessage: 'Highest diploma',
  },
  ISCED11_0: {
    id: 'app.containers.UsersEditPage.ISCED11_0',
    defaultMessage: 'E1',
  },
  ISCED11_1: {
    id: 'app.containers.UsersEditPage.ISCED11_1',
    defaultMessage: 'E2',
  },
  ISCED11_2: {
    id: 'app.containers.UsersEditPage.ISCED11_2',
    defaultMessage: 'E3',
  },
  ISCED11_3: {
    id: 'app.containers.UsersEditPage.ISCED11_3',
    defaultMessage: 'E4',
  },
  ISCED11_4: {
    id: 'app.containers.UsersEditPage.ISCED11_4',
    defaultMessage: 'E5',
  },
  ISCED11_5: {
    id: 'app.containers.UsersEditPage.ISCED11_5',
    defaultMessage: 'E6',
  },
  ISCED11_6: {
    id: 'app.containers.UsersEditPage.ISCED11_6',
    defaultMessage: 'E7',
  },
  ISCED11_7: {
    id: 'app.containers.UsersEditPage.ISCED11_7',
    defaultMessage: 'E8',
  },
  ISCED11_8: {
    id: 'app.containers.UsersEditPage.ISCED11_8',
    defaultMessage: 'E9',
  },
  /*
   * Notifications
   */
  h3: {
    id: 'app.containers.UsersEditPage.h3',
    defaultMessage: 'Notifications',
  },
  h3sub: {
    id: 'app.containers.UsersEditPage.h3sub',
    defaultMessage: 'Manage your notifications',
  },
  notifications_all_email: {
    id: 'app.containers.UsersEditPage.notifications_all_email',
    defaultMessage: 'ALL EMAIL NOTIFICATIONS',
  },
  notifications_idea_post: {
    id: 'app.containers.UsersEditPage.notifications_idea_post',
    defaultMessage: 'Someone posted an idea',
  },
  notifications_new_user: {
    id: 'app.containers.UsersEditPage.notifications_new_user',
    defaultMessage: 'New user registration',
  },
  notifications_new_comments: {
    id: 'app.containers.UsersEditPage.notifications_new_comments',
    defaultMessage: 'New comments',
  },
  notifications_all_app: {
    id: 'app.containers.UsersEditPage.notifications_all_app',
    defaultMessage: 'ALL APP NOTIFICATIONS',
  },
  notifications_comment_on_comment: {
    id: 'app.containers.UsersEditPage.notifications_comment_on_comment',
    defaultMessage: 'Someone commented on your comment',
  },
  notifications_mention: {
    id: 'app.containers.UsersEditPage.notifications_mention',
    defaultMessage: 'Someone mentioned you',
  },
  notifications_idea_comment: {
    id: 'app.containers.UsersEditPage.notifications_idea_comment',
    defaultMessage: 'Someone commented on your idea',
  },
  submit: {
    id: 'app.containers.UsersEditPage.submit',
    defaultMessage: 'Update profile',
  },
});
