// web_api/v1/permissions_custom_fields/:id
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IPermissionsCustomField, EventsKeys } from './types';

const fetchEvents = (id: string) => {
  return fetcher<IPermissionsCustomField>({
    path: `/permissions_custom_fields/${id}`,
    action: 'get',
  });
};

const usePermissionsCustomField = (id: string) => {
  return useQuery<
    IPermissionsCustomField,
    CLErrors,
    IPermissionsCustomField,
    EventsKeys
  >({
    queryKey: eventsKeys.item(id),
    queryFn: () => fetchEvents(id),
  });
};

export default usePermissionsCustomField;
