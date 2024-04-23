import { API_PATH } from 'containers/App/constants';

export const exportEventAttendees = (eventId: string) =>
  `${API_PATH}/events/${eventId}/attendees_xlsx`;
