import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import userCustomFieldssKeys from './keys';
import { IUserCustomField, UserCustomFieldsKeys } from './types';

const fetch = (customFieldId?: string) =>
  fetcher<IUserCustomField>({
    path: `/users/custom_fields/${customFieldId}`,
    action: 'get',
  });

const useUserCustomField = (customFieldId?: string) => {
  return useQuery<
    IUserCustomField,
    CLErrors,
    IUserCustomField,
    UserCustomFieldsKeys
  >({
    queryKey: userCustomFieldssKeys.item({ customFieldId }),
    queryFn: () => fetch(customFieldId),
    enabled: !!customFieldId,
  });
};

export default useUserCustomField;
