import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsOptionsKeys from './keys';
import { IUserCustomFieldOption } from './types';

type UpdateOption = {
  optionId: string;
  customFieldId: string;
  title_multiloc: Multiloc;
};

const updateOption = async ({
  optionId,
  customFieldId,
  title_multiloc,
}: UpdateOption) =>
  fetcher<IUserCustomFieldOption>({
    path: `/users/custom_fields/${customFieldId}/custom_field_options/${optionId}`,
    action: 'patch',
    body: { title_multiloc },
  });

const useUpdateUserCustomFieldsOption = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IUserCustomFieldOption,
    { errors: CLErrors },
    UpdateOption
  >({
    mutationFn: updateOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsOptionsKeys.list({
          customFieldId: variables.customFieldId,
        }),
      });
    },
  });
};

export default useUpdateUserCustomFieldsOption;
