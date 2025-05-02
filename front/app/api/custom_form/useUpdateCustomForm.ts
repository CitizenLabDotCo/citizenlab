import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndPoint from './getApiEndpoint';
import customFormKeys from './keys';
import { ICustomForm, IUpdateCustomFormProperties } from './types';

const updateCustomForm = async ({
  projectId,
  phaseId,
  printStartMultiloc,
  printEndMultiloc,
}) => {
  const apiEndpoint = getApiEndPoint(projectId, phaseId);
  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'patch',
    body: {
      print_start_multiloc: printStartMultiloc,
      print_end_multiloc: printEndMultiloc,
    },
  });
};

const useUpdateCustomForm = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomForm, CLErrors, IUpdateCustomFormProperties>({
    mutationFn: updateCustomForm,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customFormKeys.item({
          projectId: variables.projectId,
          phaseId: variables.phaseId,
        }),
      });
    },
  });
};

export default useUpdateCustomForm;
