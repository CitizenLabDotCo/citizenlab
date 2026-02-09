import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import userCustomFieldsForPermissionKeys from 'api/user_custom_fields_for_permission/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import userCustomFieldsKeys from './keys';
import { IUserCustomField } from './types';

type IReorderCause = {
  customFieldId: string;
  ordering: number;
};

const reorder = ({ customFieldId, ordering }: IReorderCause) =>
  fetcher<IUserCustomField>({
    path: `/users/custom_fields/${customFieldId}/reorder`,
    action: 'patch',
    body: { custom_field: { ordering } },
  });

const useReorderUserCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserCustomField, CLErrors, IReorderCause>({
    mutationFn: reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsForPermissionKeys.all(),
      });
    },
  });
};

export default useReorderUserCustomField;
