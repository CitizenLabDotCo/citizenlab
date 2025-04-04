import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldBinsKeys from './keys';
import { ICustomFieldBins, CustomFieldBinsKeys } from './types';

const fetchBins = ({ customFieldId }: { customFieldId?: string }) =>
  fetcher<ICustomFieldBins>({
    path: `/custom_fields/${customFieldId}/custom_field_bins`,
    action: 'get',
  });

const useCustomFieldBins = (customFieldId?: string) => {
  return useQuery<
    ICustomFieldBins,
    CLErrors,
    ICustomFieldBins,
    CustomFieldBinsKeys
  >({
    queryKey: customFieldBinsKeys.list({ customFieldId }),
    queryFn: () => fetchBins({ customFieldId }),
    enabled: !!customFieldId,
  });
};

export default useCustomFieldBins;
