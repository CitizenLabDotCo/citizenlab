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

export const textingCampaignsStream = (
  streamParams: IStreamParams | null = null
) => {
  return streams.get<ITextingCampaigns>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
};

export const textingCampaignStream = (
  campaignId: string,
  streamParams: IStreamParams | null = null
) => {
  return streams.get<ITextingCampaign>({
    apiEndpoint: `${apiEndpoint}/${campaignId}`,
    ...streamParams,
  });
};

export const addTextingCampaign = async (
  message: string,
  phone_numbers: string[]
) => {
  return streams.add<ITextingCampaign>(`${apiEndpoint}`, {
    message,
    phone_numbers,
  });
};

// only for updating numbers and message, sending will be via a different endpoint
export const updateTextingCampaign = (
  campaignId: string,
  attributes: {
    message?: string;
    phone_numbers?: string[];
  }
) => {
  return streams.update<ITextingCampaign>(
    `${apiEndpoint}/${campaignId}`,
    campaignId,
    attributes
  );
};

export const deleteTextingCampaign = async (campaignId: string) => {
  const result = await streams.delete(
    `${apiEndpoint}/${campaignId}`,
    campaignId
  );

  return result;
};
