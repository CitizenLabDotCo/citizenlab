import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndPoint from './getApiEndpoint';
import customFormKeys from './keys';
import { ICustomForm } from './types';

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

const useUpdateCustomForm = (phase: IPhaseData) => {
  const queryClient = useQueryClient();
  const apiEndpoint = getApiEndPoint(phase);

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
          projectId: phase.relationships.project.data.id,
          phaseId: phase.id,
        }),
      });
    },
  });
};

export default useUpdateCustomForm;
