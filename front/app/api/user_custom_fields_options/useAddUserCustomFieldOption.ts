import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsOptionsKeys from './keys';
import { IUserCustomFieldOption } from './types';

type AddCustomFieldOption = {
  customFieldId: string;
  title_multiloc: Multiloc;
};
const addOption = async ({
  customFieldId,
  title_multiloc,
}: AddCustomFieldOption) =>
  fetcher<IUserCustomFieldOption>({
    path: `/users/custom_fields/${customFieldId}/custom_field_options`,
    action: 'post',
    body: {
      title_multiloc,
    },
  });

const useAddUserCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IUserCustomFieldOption,
    { errors: CLErrors },
    AddCustomFieldOption
  >({
    mutationFn: addOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsOptionsKeys.list({
          customFieldId: variables.customFieldId,
        }),
      });
    },
  });
};

export default useAddUserCustomFieldOption;
