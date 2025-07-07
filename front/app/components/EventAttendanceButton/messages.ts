import { defineMessages } from 'react-intl';

export default defineMessages({
  attend: {
    id: 'app.components.EventAttendanceButton.attend',
    defaultMessage: 'Attend',
  },
  attending: {
    id: 'app.components.EventAttendanceButton.attending',
    defaultMessage: 'Attending',
  },
  maxAttendeesReached: {
    id: 'app.components.EventAttendanceButton.maxAttendeesReached',
    defaultMessage:
      'The maximum number of attendees has been reached. There are no spots left.',
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
