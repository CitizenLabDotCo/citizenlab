import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import cosponsorshipsKeys from './keys';
import {
  ICosponsorships,
  CosponsorshipsKeys,
  ICosponsorshipParameters,
} from './types';

const fetchCosponsorships = ({ ideaId }: ICosponsorshipParameters) =>
  fetcher<ICosponsorships>({
    path: `/ideas/${ideaId}/cosponsorships`,
    action: 'get',
  });

const useCosponsorships = ({ ideaId }: ICosponsorshipParameters) => {
  return useQuery<
    ICosponsorships,
    CLErrors,
    ICosponsorships,
    CosponsorshipsKeys
  >({
    queryKey: cosponsorshipsKeys.list({
      ideaId,
    }),
    queryFn: () => fetchCosponsorships({ ideaId }),
  });
};

export default useCosponsorships;
