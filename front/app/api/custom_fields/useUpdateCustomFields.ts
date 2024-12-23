import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

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
};

const updateCustomField = async ({
  projectId,
  phaseId,
  customFields,
}: IUpdateCustomFieldProperties) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields/update_all`
    : `admin/projects/${projectId}/custom_fields/update_all`;
  return fetcher<ICustomField>({
    path: `/${apiEndpoint}`,
    action: 'patch',
    body: { custom_fields: customFields },
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
    },
  });
};

export default useUpdateCustomField;
