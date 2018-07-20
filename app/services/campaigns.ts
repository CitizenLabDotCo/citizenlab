import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/campaigns`;

export interface ICampaignData {
  id: string;
  type: string;
  attributes: {
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    sent_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    author: {
      data: IRelationship;
    };
    groups: {
      data: IRelationship[];
    }
  };
}

export interface CampaignUpdate {
  subject_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  sender?: string;
  reply_to?: string;
  group_ids?: string[];
}

export interface ICampaign {
  data: ICampaignData;
}

export interface IRecipientData {
  id: string;
  type: string;
  attributes: {
    delivery_status: 'sent' | 'bounced' | 'failed' | 'accepted' | 'delivered' | 'opened' | 'clicked';
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: IRelationship;
    };
  };
}

export interface IRecipient {
  data: IRecipientData[];
}

export function listCampaigns(streamParams: IStreamParams | null = null) {
  return streams.get<{data: ICampaignData[]}>({ apiEndpoint: `${apiEndpoint}`, ...streamParams });
}

export function createCampaign(campaignData: CampaignUpdate) {
  return streams.add<ICampaign>(`${apiEndpoint}`, { campaign: campaignData });
}

export function updateCampaign(campaignId: string, campaignData: CampaignUpdate) {
  return streams.update<ICampaign>(`${apiEndpoint}/${campaignId}`, campaignId, { campaign: campaignData });
}

export function sendCampaign(campaignId: string) {
  return streams.add<ICampaign>(`${apiEndpoint}/${campaignId}/send`, {});
}

export function sendCampaignPreview(campaignId: string) {
  return streams.add<ICampaign>(`${apiEndpoint}/${campaignId}/send_preview`, {});
}

export function deleteCampaign(campaignId: string) {
  return streams.delete(`${apiEndpoint}/${campaignId}`, campaignId);
}

export function campaignByIdStream(campaignId: string, streamParams: IStreamParams | null = null) {
  return streams.get<ICampaign>({ apiEndpoint: `${apiEndpoint}/${campaignId}`, ...streamParams });
}

export function listCampaignRecipients(campaignId: string, streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IRecipientData[] }>({ apiEndpoint: `${apiEndpoint}/${campaignId}/recipients`, ...streamParams });
}
