import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { ITextingCampaign, TextingCampaignsKeys } from './types';

export const fetchTextingCampaign = (id: string) =>
  fetcher<ITextingCampaign>({
    path: `/texting_campaigns/${id}`,
    action: 'get',
  });

const useTextingCampaign = (id: string) => {
  return useQuery<
    ITextingCampaign,
    CLErrors,
    ITextingCampaign,
    TextingCampaignsKeys
  >({
    queryKey: projectsKeys.item({ id }),
    queryFn: () => fetchTextingCampaign(id),
  });
};

export default useTextingCampaign;
