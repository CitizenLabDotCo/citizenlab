import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import optionKeys from './keys';

const deleteOption = async ({
  customFieldId,
  optionId,
}: {
  customFieldId: string;
  optionId: string;
}) =>
  fetcher({
    path: `/users/custom_fields/${customFieldId}/custom_field_options/${optionId}`,
    action: 'delete',
  });

const useDeleteUserCustomFieldsOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: optionKeys.list({ customFieldId: variables.customFieldId }),
      });
    },
  });
};

export default useDeleteUserCustomFieldsOption;
