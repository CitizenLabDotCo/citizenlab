import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndPoint from './getApiEndpoint';
import customFormKeys from './keys';
import { ICustomForm, ICustomFormParameters } from './types';

type UpdateCustomFormProperties = {
  printStartMultiloc: Multiloc;
  printEndMultiloc: Multiloc;
};

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
  return useMutation<ICustomForm, CLErrors, UpdateCustomFormProperties>({
    mutationFn: ({ printStartMultiloc, printEndMultiloc }) =>
      updateCustomForm({
        apiEndpoint,
        printStartMultiloc,
        printEndMultiloc,
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
