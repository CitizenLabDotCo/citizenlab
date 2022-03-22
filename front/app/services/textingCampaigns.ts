import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export const apiEndpoint = `${API_PATH}/texting_campaigns`;

export type ITextingCampaignStatuses = 'draft' | 'sending' | 'sent' | 'failed';

export interface ITextingCampaignData {
  id: string;
  attributes: {
    message: string;
    status: ITextingCampaignStatuses;
    sent_at: string;
    phone_numbers: string[];
  };
}

export interface ITextingCampaign {
  data: ITextingCampaignData;
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

export function textingCampaignStream(
  campaignId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<ITextingCampaign>({
    apiEndpoint: `${apiEndpoint}/${campaignId}`,
    ...streamParams,
  });
}

export function addTextingCampaign(message: string, phone_numbers: string[]) {
  return streams.add<ITextingCampaign>(`${apiEndpoint}`, {
    message,
    phone_numbers,
  });
}
