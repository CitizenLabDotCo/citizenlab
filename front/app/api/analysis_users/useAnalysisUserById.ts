import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import analysisUsersKeys from './keys';
import { IAnalysisUser, AnalysisUsersKeys } from './types';
import fetcher from 'utils/cl-react-query/fetcher';

const fetchAnalysisUserById = ({
  id,
  analysisId,
}: {
  id?: string | null;
  analysisId: string;
}) =>
  fetcher<IAnalysisUser>({
    path: `/analyses/${analysisId}/users/${id}`,
    action: 'get',
  });

const useAnalysisUserById = ({
  id,
  analysisId,
}: {
  id: string | null;
  analysisId: string;
}) => {
  return useQuery<IAnalysisUser, CLErrors, IAnalysisUser, AnalysisUsersKeys>({
    queryKey: analysisUsersKeys.item({ id }),
    queryFn: () => fetchAnalysisUserById({ id, analysisId }),
    enabled: !!id,
  });
};

export default useAnalysisUserById;
