import { QueryObserver } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import meKeys from './keys';
import { MeKeys } from './types';
import { BehaviorSubject } from 'rxjs';
import { fetchMe } from './useAuthUser';
import { IUser } from 'services/users';

const authUserStream = new BehaviorSubject<IUser | undefined>(undefined);

const authUserStreamQueryObserver = new QueryObserver<
  IUser,
  CLErrors,
  IUser,
  MeKeys
>(queryClient, {
  queryKey: meKeys.all(),
  queryFn: fetchMe,
  retry: false,
  keepPreviousData: false,
  staleTime: 0,
  cacheTime: 0,
});

authUserStreamQueryObserver.subscribe((query) => {
  return authUserStream.next(query?.data);
});

/** @deprecated Only used for backwards compatibility reasons with streams. Do not use in React components or hooks */
export default authUserStream;
