import { useMutation, useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash-es';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IAddEventFileProperties, IEventFile } from './types';

const addEventFile = async (requestBody: IAddEventFileProperties) => {
  return fetcher<IEventFile>({
    path: `/events/${requestBody.eventId}/files`,
    action: 'post',
    body: { file: omit(requestBody, 'eventId') },
  });
};

const useAddEventFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IEventFile, CLErrors, IAddEventFileProperties>({
    mutationFn: addEventFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export default useAddEventFile;
