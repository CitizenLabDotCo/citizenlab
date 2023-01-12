import { IRelationship, Multiloc, ILinks } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/campaigns`;

export interface ICampaignsData {
  data: ICampaignData[];
  links: ILinks;
}

export interface ICampaignData {
  id: string;
  type: string;
  attributes: {
    campaign_name: string;
    admin_campaign_description_multiloc: Multiloc;
    enabled?: boolean;
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    created_at: string;
    updated_at: string;
    deliveries_count: number;
    schedule: any;
    schedule_multiloc: Multiloc;
  };
  relationships: {
    author: {
      data: IRelationship;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export interface CampaignUpdate {
  campaign_name?: string;
  subject_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  sender?: string;
  reply_to?: string;
  group_ids?: string[];
  enabled?: boolean;
}

export interface ICampaign {
  data: ICampaignData;
}

export function listCampaigns(streamParams: IStreamParams | null = null) {
  return streams.get<ICampaignsData>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}

export function updateCampaign(
  campaignId: string,
  campaignData: CampaignUpdate
) {
  return streams.update<ICampaign>(`${apiEndpoint}/${campaignId}`, campaignId, {
    campaign: campaignData,
  });
}
