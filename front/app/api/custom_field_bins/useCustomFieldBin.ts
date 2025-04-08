import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldBinsKeys from './keys';
import { ICustomFieldBin, CustomFieldBinsKeys } from './types';

const fetchBin = ({ binId }: { binId?: string }) =>
  fetcher<ICustomFieldBin>({
    path: `/custom_field_bins/${binId}`,
    action: 'get',
  });

const useCustomFieldBin = ({ binId }: { binId?: string }) => {
  return useQuery<
    ICustomFieldBin,
    CLErrors,
    ICustomFieldBin,
    CustomFieldBinsKeys
  >({
    queryKey: customFieldBinsKeys.item({ binId }),
    queryFn: () => fetchBin({ binId }),
    enabled: !!binId,
  });
};

export default useCustomFieldBin;
