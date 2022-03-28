import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/texting_campaigns`;

export type ITextingCampaignStatuses = 'draft' | 'sending' | 'sent' | 'failed';

export interface ITextingCampaignData {
  id: string;
  attributes: {
    message: string;
    status: ITextingCampaignStatuses;
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

// only for updating numbers and message, sending will be via a different endpoint
// commented out to appease linter for now, will be used in the next PR
// export const updateTextingCampaign = async (
//   campaignId: string,
//   attributes: {
//     message?: string;
//     phone_numbers?: string[];
//   }
// ) => {
//   const result = await streams.update<ITextingCampaign>(
//     `${apiEndpoint}/${campaignId}`,
//     campaignId,
//     attributes
//   );

//   return result;
// };

export const deleteTextingCampaign = async (campaignId: string) => {
  const result = await streams.delete(
    `${apiEndpoint}/${campaignId}`,
    campaignId
  );

  return result;
};
