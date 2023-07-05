import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUserCustomFieldOption } from './types';
import userCustomFieldsOptionsKeys from './keys';

type IReorderCause = {
  customFieldId: string;
  optionId: string;
  ordering: number;
};

const reorderOption = ({ customFieldId, optionId, ordering }: IReorderCause) =>
  fetcher<IUserCustomFieldOption>({
    path: `/users/custom_fields/${customFieldId}/custom_field_options/${optionId}/reorder`,
    action: 'patch',
    body: { custom_field_option: { ordering } },
  });

const useReorderUserCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserCustomFieldOption, CLErrors, IReorderCause>({
    mutationFn: reorderOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsOptionsKeys.list({
          customFieldId: variables.customFieldId,
        }),
      });
    },
  });
};

export default useReorderUserCustomFieldOption;
