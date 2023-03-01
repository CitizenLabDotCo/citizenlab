import { useQuery } from '@tanstack/react-query';
import { IEventFiles } from 'services/eventFiles';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { isNilOrError } from 'utils/helperUtils';
import eventFilesKeys from './keys';
import { EventFilesKeys } from './types';

const fetchEvents = (eventId: string) => {
  return fetcher<IEventFiles>({
    path: `/events/${eventId}/files`,
    action: 'get',
  });
};

const useEventFiles = (eventId: string) => {
  return useQuery<IEventFiles, CLErrors, IEventFiles, EventFilesKeys>({
    queryKey: eventFilesKeys.list(eventId),
    queryFn: () => fetchEvents(eventId),
    enabled: !isNilOrError(eventId),
  });
};

export default useEventFiles;
