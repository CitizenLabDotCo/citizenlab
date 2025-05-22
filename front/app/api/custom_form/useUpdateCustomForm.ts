import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';

import fetcher from 'utils/cl-react-query/fetcher';

import getApiEndpoint from './getApiEndpoint';
import customFormKeys from './keys';
import { ICustomForm } from './types';

/**
 * Properties that can be updated in a custom form
 */
type UpdateCustomFormProperties = {
  printStartMultiloc?: Multiloc;
  printEndMultiloc?: Multiloc;
  printPersonalDataFields?: boolean;
};

/**
 * Updates a custom form with the provided values
 * @param apiEndpoint - The API endpoint for the custom form
 * @param formValues - The values to update in the custom form
 * @returns The updated custom form
 */
const updateCustomForm = async ({
  apiEndpoint,
  formValues,
}: {
  apiEndpoint: string;
  formValues: UpdateCustomFormProperties;
}) => {
  // Only include properties that are defined
  const body: Record<string, Multiloc | boolean> = {};

  if (formValues.printStartMultiloc) {
    body.print_start_multiloc = formValues.printStartMultiloc;
  }

  if (formValues.printEndMultiloc) {
    body.print_end_multiloc = formValues.printEndMultiloc;
  }

  if (typeof formValues.printPersonalDataFields === 'boolean') {
    body.print_personal_data_fields = formValues.printPersonalDataFields;
  }

  return fetcher<ICustomForm>({
    path: `/${apiEndpoint}`,
    action: 'patch',
    body,
  });
};

/**
 * Hook to update a custom form
 * @param phase - The phase data containing the custom form
 * @returns A mutation to update the custom form
 */
const useUpdateCustomForm = (phase: IPhaseData) => {
  const queryClient = useQueryClient();
  const apiEndpoint = getApiEndpoint(phase);

  return useMutation<ICustomForm, CLErrors, UpdateCustomFormProperties>({
    mutationFn: (formValues) =>
      updateCustomForm({
        apiEndpoint,
        formValues,
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
