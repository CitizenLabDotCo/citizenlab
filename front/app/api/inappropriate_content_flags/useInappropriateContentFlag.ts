import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import {
  InappropriateContentFlagsKeys,
  IInappropriateContentFlag,
} from './types';

const fetchInappropriateContentFlag = ({ id }: { id?: string }) =>
  fetcher<IInappropriateContentFlag>({
    path: `/inappropriate_content_flags/${id}`,
    action: 'get',
  });

const useInappropriateContentFlag = (id?: string) => {
  return useQuery<
    IInappropriateContentFlag,
    CLErrors,
    IInappropriateContentFlag,
    InappropriateContentFlagsKeys
  >({
    queryKey: eventsKeys.item({ id }),
    queryFn: () => fetchInappropriateContentFlag({ id }),
    enabled: !!id,
  });
};

export default useInappropriateContentFlag;
