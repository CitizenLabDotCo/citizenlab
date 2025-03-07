import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { isNilOrError } from 'utils/helperUtils';

import eventFilesKeys from './keys';
import { IEventFiles, EventFilesKeys } from './types';

const fetchEvents = ({ eventId }: { eventId: string | undefined }) => {
  return fetcher<IEventFiles>({
    path: `/events/${eventId}/files`,
    action: 'get',
  });
};

const useEventFiles = (eventId: string | undefined) => {
  return useQuery<IEventFiles, CLErrors, IEventFiles, EventFilesKeys>({
    queryKey: eventFilesKeys.list({ eventId }),
    queryFn: () => fetchEvents({ eventId }),
    enabled: !isNilOrError(eventId),
  });
};

export default useEventFiles;
