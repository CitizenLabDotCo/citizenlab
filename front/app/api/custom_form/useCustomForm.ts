import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFormKeys from './keys';
import { CustomFormKeys, ICustomForm } from './types';

const fetchCustomForm = (phaseId: string) => {
  return fetcher<ICustomForm>({
    path: `/phases/${phaseId}/custom_form`,
    action: 'get',
  });
};

const useCustomForm = (phaseId: string) => {
  return useQuery<ICustomForm, CLErrors, ICustomForm, CustomFormKeys>({
    queryKey: customFormKeys.item({ phaseId }),
    queryFn: () => fetchCustomForm(phaseId),
  });
};

export default useCustomForm;
