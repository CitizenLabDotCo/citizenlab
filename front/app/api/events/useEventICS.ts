import fetcher from 'utils/cl-react-query/fetcher';

export const fetchEventICS = (eventId: string) => {
  return fetcher({
    path: `/events/${eventId}.ics`,
    action: 'get',
  });
};
