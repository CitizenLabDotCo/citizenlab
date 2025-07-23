import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

interface ISupportedCampaignNamesData {
  data: {
    type: string;
    attributes: string[];
  };
}

const fetchSupportedCampaignNames = (projectId?: string, phaseId?: string) => {
  let path: string;

  if (phaseId) {
    path = `/phases/${phaseId}/campaigns/supported_campaigns`;
  } else if (projectId) {
    path = `/projects/${projectId}/campaigns/supported_campaigns`;
  } else {
    path = '/campaigns/supported_campaigns';
  }

  return fetcher<ISupportedCampaignNamesData>({
    path: path as `/${string}`,
    action: 'get',
  });
};

const useSupportedCampaignNames = ({
  projectId,
  phaseId,
}: {
  projectId?: string;
  phaseId?: string;
} = {}): UseQueryResult<ISupportedCampaignNamesData, CLErrors> => {
  return useQuery<ISupportedCampaignNamesData, CLErrors>({
    queryKey: ['campaign', 'supported_campaigns', { projectId, phaseId }],
    queryFn: () => fetchSupportedCampaignNames(projectId, phaseId),
  });
};

export default useSupportedCampaignNames;
