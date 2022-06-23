import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/texting_campaigns`;

export type TTextingCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface ITextingCampaignData {
  id: string;
  attributes: {
    message: string;
    status: TTextingCampaignStatus;
    sent_at: string;
    created_at: string;
    updated_at: string;
    phone_numbers: string[];
  };
}

export interface ITextingCampaign {
  data: ITextingCampaignData;
}

export interface ITextingCampaigns {
  data: ITextingCampaignData[];
}

// multiple campaigns
export const textingCampaignsStream = (
  streamParams: IStreamParams | null = null
) => {
  return streams.get<ITextingCampaigns>({
    apiEndpoint,
    ...streamParams,
  });
};

// one campaign by ID
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
  const result = await streams.add<ITextingCampaign>(apiEndpoint, {
    message,
    phone_numbers,
  });
  return result;
};

export const updateTextingCampaign = async (
  campaignId: string,
  attributes: {
    message?: string;
    phone_numbers?: string[];
  }
) => {
  const result = await streams.update<ITextingCampaign>(
    `${apiEndpoint}/${campaignId}`,
    campaignId,
    attributes
  );

  return result;
};

export const deleteTextingCampaign = async (campaignId: string) => {
  const result = await streams.delete(
    `${apiEndpoint}/${campaignId}`,
    campaignId
  );

  return result;
};

export const sendTextingCampaign = async (campaignId: string) => {
  const result = await streams.add(
    `${apiEndpoint}/${campaignId}/send`,
    // no body required, just POST to /send
    {}
  );

  // campaign should be status "Sending" now, re-fetch the entity from BE
  await streams.fetchAllWith({
    apiEndpoint: [apiEndpoint, `${apiEndpoint}/${campaignId}`],
  });

  return result;
};
