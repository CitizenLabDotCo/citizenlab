import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/campaigns`;

export interface ICampaignStats {
  data: {
    type: 'stats';
    attributes: {
      sent: number;
      bounced: number;
      failed: number;
      accepted: number;
      delivered: number;
      opened: number;
      clicked: number;
      all: number;
    };
  };
}

export function getCampaignStats(
  campaignId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICampaignStats>({
    apiEndpoint: `${apiEndpoint}/${campaignId}/stats`,
    ...streamParams,
  });
}
