import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsOptionsKeys from './keys';
import { IUserCustomFieldOption, UserCustomFieldsOptionsKeys } from './types';

const fetchOption = ({
  customFieldId,
  optionId,
}: {
  customFieldId: string;
  optionId: string;
}) =>
  fetcher<IUserCustomFieldOption>({
    path: `/users/custom_fields/${customFieldId}/custom_field_options/${optionId}`,
    action: 'get',
  });

const useUserCustomFieldOption = ({
  customFieldId,
  optionId,
}: {
  customFieldId: string;
  optionId: string;
}) => {
  return useQuery<
    IUserCustomFieldOption,
    CLErrors,
    IUserCustomFieldOption,
    UserCustomFieldsOptionsKeys
  >({
    queryKey: userCustomFieldsOptionsKeys.item({ customFieldId, optionId }),
    queryFn: () => fetchOption({ customFieldId, optionId }),
  });
};

export default useUserCustomFieldOption;
