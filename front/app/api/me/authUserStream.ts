import { QueryObserver } from '@tanstack/react-query';
import { BehaviorSubject } from 'rxjs';
import { CLErrors } from 'typings';

import { IUser } from 'api/users/types';

import { queryClient } from 'utils/cl-react-query/queryClient';

import meKeys from './keys';
import { MeKeys } from './types';
import { fetchMe } from './useAuthUser';

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
});

authUserStreamQueryObserver.subscribe((query) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return authUserStream.next(query?.data);
});

/** @deprecated Only used for backwards compatibility reasons with streams. Do not use in React components or hooks */
export default authUserStream;
