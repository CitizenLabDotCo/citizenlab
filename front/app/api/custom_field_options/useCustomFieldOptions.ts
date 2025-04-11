import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionsKeys from './keys';
import { ICustomFieldOptions, CustomFieldOptionsKeys } from './types';

const fetchOptions = ({ customFieldId }: { customFieldId?: string }) =>
  fetcher<ICustomFieldOptions>({
    path: `/custom_fields/${customFieldId}/custom_field_options`,
    action: 'get',
  });

const useCustomFieldOptions = (customFieldId?: string) => {
  return useQuery<
    ICustomFieldOptions,
    CLErrors,
    ICustomFieldOptions,
    CustomFieldOptionsKeys
  >({
    queryKey: customFieldOptionsKeys.list({ customFieldId }),
    queryFn: () => fetchOptions({ customFieldId }),
    enabled: !!customFieldId,
  });
};

export default useCustomFieldOptions;
