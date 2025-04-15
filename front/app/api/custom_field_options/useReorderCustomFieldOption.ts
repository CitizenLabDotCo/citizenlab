import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionsKeys from './keys';
import { ICustomFieldOption } from './types';

type IReorderCause = {
  optionId: string;
  ordering: number;
};

const reorderOption = ({ optionId, ordering }: IReorderCause) =>
  fetcher<ICustomFieldOption>({
    path: `/custom_field_options/${optionId}/reorder`,
    action: 'patch',
    body: { custom_field_option: { ordering } },
  });

const useReorderCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomFieldOption, CLErrors, IReorderCause>({
    mutationFn: reorderOption,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: customFieldOptionsKeys.lists(),
      });
    },
  });
};

export default useReorderCustomFieldOption;
