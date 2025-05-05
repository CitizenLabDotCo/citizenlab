import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import customFormKeys from 'api/custom_form/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldsKeys from './keys';
import { ICustomField, ICustomFieldResponse } from './types';

type IUpdateCustomFieldProperties = {
  projectId: string;
  phaseId: string;
  isFormPhaseSpecific: boolean;
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
  isFormPhaseSpecific,
  customFields,
  customForm,
}: IUpdateCustomFieldProperties) => {
  const apiEndpoint = isFormPhaseSpecific
    ? `admin/phases/${phaseId}/custom_fields/update_all`
    : `admin/projects/${projectId}/custom_fields/update_all`;

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
    onSuccess: (_, { phaseId, projectId }) => {
      queryClient.invalidateQueries({
        queryKey: customFieldsKeys.list({
          projectId,
          phaseId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: customFormKeys.item({
          phaseId,
        }),
      });
    },
  });
};

export default useUpdateCustomField;
