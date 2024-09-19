import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import cosponsorshipsKeys from './keys';
import {
  ICosponsorships,
  CosponsorshipsKeys,
  ICosponsorshipParameters,
} from './types';

const fetchCosponsorships = ({ ideaId, id }: ICosponsorshipParameters) =>
  fetcher<ICosponsorships>({
    path: `/ideas/${ideaId}/cosponsorships/${id}`,
    action: 'get',
  });

const useCosponsorships = ({ ideaId, id }: ICosponsorshipParameters) => {
  return useQuery<
    ICosponsorships,
    CLErrors,
    ICosponsorships,
    CosponsorshipsKeys
  >({
    queryKey: cosponsorshipsKeys.list({
      ideaId,
      id,
    }),
    queryFn: () => fetchCosponsorships({ ideaId, id }),
  });
};

export default useCosponsorships;
