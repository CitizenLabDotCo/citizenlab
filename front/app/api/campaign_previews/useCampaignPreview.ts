import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignPreviewsKeys from './keys';
import { ICampaignPreview, CampaignPreviewsKeys } from './types';

const fetchCampaignPreview = ({ campaignId }: { campaignId: string }) =>
  fetcher<ICampaignPreview>({
    path: `/campaigns/${campaignId}/preview`,
    action: 'get',
  });

const useCampaignPreview = (campaignId: string) => {
  return useQuery<
    ICampaignPreview,
    CLErrors,
    ICampaignPreview,
    CampaignPreviewsKeys
  >({
    queryKey: campaignPreviewsKeys.item({ campaignId }),
    queryFn: () => fetchCampaignPreview({ campaignId }),
  });
};

export default useCampaignPreview;
