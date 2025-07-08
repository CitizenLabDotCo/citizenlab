import { defineMessages } from 'react-intl';

export default defineMessages({
  register: {
    id: 'app.components.EventAttendanceButton.register',
    defaultMessage: 'Register',
  },
  registered: {
    id: 'app.components.EventAttendanceButton.registered',
    defaultMessage: 'Registered',
  },
  maxRegistrationsReached: {
    id: 'app.components.EventAttendanceButton.maxRegistrationsReached',
    defaultMessage:
      'The maximum number of event registrations has been reached. There are no spots left.',
  },
  seeYouThereName: {
    id: 'app.components.EventAttendanceButton.seeYouThereName',
    defaultMessage: 'See you there, {userFirstName}!',
  },
  seeYouThere: {
    id: 'app.components.EventAttendanceButton.seeYouThere',
    defaultMessage: 'See you there!',
  },
  forwardToFriend: {
    id: 'app.components.EventAttendanceButton.forwardToFriend',
    defaultMessage: 'Forward to a friend',
  },
});
