import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsOptionsKeys from './keys';
import { IUserCustomFieldOptions, UserCustomFieldsOptionsKeys } from './types';

const fetchOptions = ({ customFieldId }: { customFieldId?: string }) =>
  fetcher<IUserCustomFieldOptions>({
    path: `/users/custom_fields/${customFieldId}/custom_field_options`,
    action: 'get',
  });

const useUserCustomFieldsOptions = (customFieldId?: string) => {
  return useQuery<
    IUserCustomFieldOptions,
    CLErrors,
    IUserCustomFieldOptions,
    UserCustomFieldsOptionsKeys
  >({
    queryKey: userCustomFieldsOptionsKeys.list({ customFieldId }),
    queryFn: () => fetchOptions({ customFieldId }),
    enabled: !!customFieldId,
  });
};

export default useUserCustomFieldsOptions;
