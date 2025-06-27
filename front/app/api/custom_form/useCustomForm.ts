import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPhaseData } from 'api/phases/types';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndpoint from './getApiEndpoint';
import customFormKeys from './keys';
import { CustomFormKeys, ICustomForm } from './types';

const fetchCustomForm = (phase: IPhaseData) => {
  const apiEndpoint = getApiEndpoint(phase);

  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'get',
  });
};

const useCustomForm = (phase: IPhaseData) => {
  return useQuery<ICustomForm, CLErrors, ICustomForm, CustomFormKeys>({
    queryKey: customFormKeys.item({
      projectId: phase.relationships.project.data.id,
      phaseId: phase.id,
    }),
    queryFn: () => fetchCustomForm(phase),
  });
};

export default useCustomForm;
