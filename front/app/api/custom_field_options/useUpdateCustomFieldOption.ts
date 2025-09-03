import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionsKeys from './keys';
import { ICustomFieldOption } from './types';

type UpdateOption = {
  optionId: string;
  title_multiloc: Multiloc;
};

const updateOption = async ({ optionId, title_multiloc }: UpdateOption) =>
  fetcher<ICustomFieldOption>({
    path: `/custom_field_options/${optionId}`,
    action: 'patch',
    body: { title_multiloc },
  });

const useUpdateCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomFieldOption, { errors: CLErrors }, UpdateOption>({
    mutationFn: updateOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: customFieldOptionsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: customFieldOptionsKeys.item({
          optionId: variables.optionId,
        }),
      });
    },
  });
};

export default useUpdateCustomFieldOption;
