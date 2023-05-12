import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phaseFilesKeys, { PhaseFilesKeys } from './keys';
import { IPhaseFiles } from './types';

const fetchPhaseFiles = ({ phaseId }: { phaseId: string }) =>
  fetcher<IPhaseFiles>({
    path: `/phases/${phaseId}/files`,
    action: 'get',
  });

const usePhaseFiles = (phaseId: string) => {
  return useQuery<IPhaseFiles, CLErrors, IPhaseFiles, PhaseFilesKeys>({
    queryKey: phaseFilesKeys.list({ phaseId }),
    queryFn: () => fetchPhaseFiles({ phaseId }),
  });
};

export default usePhaseFiles;
