import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionsKeys from './keys';
import { ICustomFieldOption, CustomFieldOptionsKeys } from './types';

export const fetchOption = ({ optionId }: { optionId?: string }) =>
  fetcher<ICustomFieldOption>({
    path: `/custom_field_options/${optionId}`,
    action: 'get',
  });

const useCustomFieldOption = ({
  optionId,
  enabled = true,
}: {
  optionId?: string;
  enabled?: boolean;
}) => {
  return useQuery<
    ICustomFieldOption,
    CLErrors,
    ICustomFieldOption,
    CustomFieldOptionsKeys
  >({
    queryKey: customFieldOptionsKeys.item({ optionId }),
    queryFn: () => fetchOption({ optionId }),
    enabled: !!optionId && enabled,
  });
};

export default useCustomFieldOption;
