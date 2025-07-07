import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

interface ISupportedCampaignTypesData {
  data: {
    id: string;
    type: string;
    attributes: string[];
  };
  included?: any[];
}

const fetchSupportedCampaignTypes = (projectId?: string, phaseId?: string) => {
  let path: string;

  if (phaseId) {
    path = `/phases/${phaseId}/campaigns/supported_campaign_types`;
  } else if (projectId) {
    path = `/projects/${projectId}/campaigns/supported_campaign_types`;
  } else {
    path = '/campaigns/supported_campaign_types';
  }

  return fetcher<ISupportedCampaignTypesData>({
    path: path as `/${string}`,
    action: 'get',
  });
};

const useSupportedCampaignTypes = ({
  projectId,
  phaseId,
}: {
  projectId?: string;
  phaseId?: string;
} = {}) => {
  return useQuery<ISupportedCampaignTypesData, CLErrors>({
    queryKey: ['campaign', 'supported_campaign_types', { projectId, phaseId }],
    queryFn: () => fetchSupportedCampaignTypes(projectId, phaseId),
  });
};

export default useSupportedCampaignTypes;
