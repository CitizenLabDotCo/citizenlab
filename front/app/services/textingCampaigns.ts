import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/texting_campaigns`;

export type TTextingCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface ITextingCampaignData {
  id: string;
  type: 'campaign';
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
