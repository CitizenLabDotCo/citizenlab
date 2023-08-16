import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInput, InputsKeys } from './types';
import inputsKeys from './keys';

const fetchInput = (analysisId: string, id?: string) =>
  fetcher<IInput>({
    path: `/analyses/${analysisId}/inputs/${id}`,
    action: 'get',
  });

const useAnalysisInput = (analysisId: string, inputId?: string) => {
  return useQuery<IInput, CLErrors, IInput, InputsKeys>({
    queryKey: inputsKeys.item({ id: inputId }),
    queryFn: () => fetchInput(analysisId, inputId),
    enabled: !!inputId,
  });
};

export default useAnalysisInput;
