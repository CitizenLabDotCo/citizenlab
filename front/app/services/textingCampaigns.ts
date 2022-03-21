import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/texting_campaigns`;

export interface ITextingCampaignData {
  id: string;
  attributes: {
    message: string;
    status: string;
    sent_at: string;
    phone_numbers: string[];
  };
}

export interface ITextingCampaigns {
  data: ITextingCampaignData[];
}

export function textingCampaignsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ITextingCampaigns>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}
