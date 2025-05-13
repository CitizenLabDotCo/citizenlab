import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { IReferenceDistribution, ReferenceDistributionKeys } from './types';

const fetchReferenceDistribution = ({ id }: { id: string }) =>
  fetcher<IReferenceDistribution>({
    path: `/users/custom_fields/${id}/reference_distribution`,
    action: 'get',
  });

const useReferenceDistribution = ({ id }: { id: string }) => {
  return useQuery<
    IReferenceDistribution,
    CLErrors,
    IReferenceDistribution,
    ReferenceDistributionKeys
  >({
    queryKey: areasKeys.item({ id }),
    queryFn: () => fetchReferenceDistribution({ id }),
  });
};

export default useReferenceDistribution;
