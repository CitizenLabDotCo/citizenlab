import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import usersKeys from './keys';
import { IAnalysisUser, AnalysisUsersKeys } from './types';

const useAnalysisUserById = (userId: string | null) => {
  return useQuery<IAnalysisUser, CLErrors, IAnalysisUser, AnalysisUsersKeys>({
    queryKey: usersKeys.item({ id: userId }),
    queryFn: () => {
      throw new Error(
        'useAnalysisUserById query should never execute, there is no endpoint for this type of user. Only included resources'
      );
    },
    enabled: !!userId,
  });
};

export default useAnalysisUserById;
