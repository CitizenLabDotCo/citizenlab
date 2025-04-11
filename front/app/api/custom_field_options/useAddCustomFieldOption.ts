import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionsKeys from './keys';
import { ICustomFieldOption } from './types';

type AddCustomFieldOption = {
  customFieldId: string;
  title_multiloc: Multiloc;
};
const addOption = async ({
  customFieldId,
  title_multiloc,
}: AddCustomFieldOption) =>
  fetcher<ICustomFieldOption>({
    path: `/custom_fields/${customFieldId}/custom_field_options`,
    action: 'post',
    body: {
      title_multiloc,
    },
  });

const useAddCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICustomFieldOption,
    { errors: CLErrors },
    AddCustomFieldOption
  >({
    mutationFn: addOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: customFieldOptionsKeys.list({
          customFieldId: variables.customFieldId,
        }),
      });
    },
  });
};

export default useAddCustomFieldOption;
