import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import customFormKeys from 'api/custom_form/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldsKeys from './keys';
import { ICustomField, ICustomFieldResponse } from './types';

type IUpdateCustomFieldProperties = {
  projectId: string;
  phaseId?: string;
  customFields: (Omit<
    ICustomFieldResponse,
    'type' | 'attributes' | 'relationships' | 'id'
  > & {
    id?: string;
  })[];
  customForm: {
    saveType: 'auto' | 'manual';
    openedAt?: string;
    fieldsLastUpdatedAt?: string;
  };
};

const updateCustomField = async ({
  projectId,
  phaseId,
  customFields,
  customForm,
}: IUpdateCustomFieldProperties) => {
  const apiEndpoint = phaseId
    ? `phases/${phaseId}/custom_fields/update_all`
    : `projects/${projectId}/custom_fields/update_all`;
  return fetcher<ICustomField>({
    path: `/${apiEndpoint}`,
    action: 'patch',
    body: {
      custom_fields: customFields,
      form_save_type: customForm.saveType,
      form_opened_at: customForm.openedAt,
      fields_last_updated_at: customForm.fieldsLastUpdatedAt,
    },
  });
};

const useUpdateCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomField, CLErrors, IUpdateCustomFieldProperties>({
    mutationFn: updateCustomField,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customFieldsKeys.list({
          projectId: variables.projectId,
          phaseId: variables.phaseId,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: customFormKeys.item({
          projectId: variables.projectId,
        }),
      });

      if (variables.phaseId) {
        queryClient.invalidateQueries({
          queryKey: customFormKeys.item({
            projectId: variables.projectId,
            phaseId: variables.phaseId,
          }),
        });
      }
    },
  });
};

export default useUpdateCustomField;
