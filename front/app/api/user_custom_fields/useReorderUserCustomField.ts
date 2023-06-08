import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUserCustomField } from './types';
import userCustomFieldsKeys from './keys';
import schemaKeys from 'api/custom_fields_json_form_schema/keys';

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
      queryClient.invalidateQueries({ queryKey: schemaKeys.all() });
    },
  });
};

export default useReorderUserCustomField;
