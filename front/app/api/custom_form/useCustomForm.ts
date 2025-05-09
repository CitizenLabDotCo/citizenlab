import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFormKeys from './keys';
import { CustomFormKeys, ICustomForm, ICustomFormParameters } from './types';

const fetchCustomForm = ({ projectId, phaseId }: ICustomFormParameters) => {
  const apiEndpoint = phaseId
    ? `phases/${phaseId}/custom_form`
    : `projects/${projectId}/custom_form`;

  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'get',
  });
};

const useCustomForm = ({ projectId, phaseId }: ICustomFormParameters) => {
  return useQuery<ICustomForm, CLErrors, ICustomForm, CustomFormKeys>({
    queryKey: customFormKeys.item({ projectId, phaseId }),
    queryFn: () =>
      fetchCustomForm({
        projectId,
        phaseId,
      }),
  });
};

export default useCustomForm;
