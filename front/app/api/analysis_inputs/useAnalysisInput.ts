import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputsKeys from './keys';
import { IInput, InputsKeys } from './types';

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
