import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import optionKeys from './keys';
import schemaKeys from 'api/custom_fields_json_form_schema/keys';

const deleteField = async (customFieldId: string) =>
  fetcher({
    path: `/users/custom_fields/${customFieldId}`,
    action: 'delete',
  });

const useDeleteUserCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: optionKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: schemaKeys.all() });
    },
  });
};

export default useDeleteUserCustomField;
