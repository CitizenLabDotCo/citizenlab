import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndPoint from './getApiEndpoint';
import customFormKeys from './keys';
import { ICustomForm, ICustomFormParameters } from './types';

interface IUpdateCustomFormProperties {
  print_start_multiloc: Multiloc;
  print_end_multiloc: Multiloc;
}

const updateCustomForm = async ({
  apiEndpoint,
  printStartMultiloc,
  printEndMultiloc,
}: {
  apiEndpoint: string;
  printStartMultiloc: Multiloc;
  printEndMultiloc: Multiloc;
}) => {
  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'patch',
    body: {
      print_start_multiloc: printStartMultiloc,
      print_end_multiloc: printEndMultiloc,
    },
  });
};

const useUpdateCustomForm = ({ projectId, phaseId }: ICustomFormParameters) => {
  const apiEndpoint = getApiEndPoint(projectId, phaseId);
  const queryClient = useQueryClient();
  return useMutation<ICustomForm, CLErrors, IUpdateCustomFormProperties>({
    mutationFn: (variables) =>
      updateCustomForm({
        apiEndpoint,
        printStartMultiloc: variables.print_start_multiloc,
        printEndMultiloc: variables.print_end_multiloc,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customFormKeys.item({
          projectId,
          phaseId,
        }),
      });
    },
  });
};

export default useUpdateCustomForm;
