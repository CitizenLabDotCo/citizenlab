import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFormKeys from './keys';
import { CustomFormKeys, ICustomForm, ICustomFormParameters } from './types';

const fetchCustomForm = ({ projectId, phaseId }: ICustomFormParameters) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields/custom_form`
    : `admin/projects/${projectId}/custom_fields/custom_form`;

  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'get',
  });
};

const useCustomForm = ({ projectId, phaseId }: ICustomFormParameters) => {
  return useQuery<ICustomForm, CLErrors, ICustomForm, CustomFormKeys>({
    queryKey: customFormKeys.item({ projectId: projectId, phaseId: phaseId }),
    queryFn: () =>
      fetchCustomForm({
        projectId,
        phaseId,
      }),
  });
};

export default useCustomForm;
