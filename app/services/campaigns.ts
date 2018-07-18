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
      data: IRelationship[];
    };
  };
}

export interface CampaignUpdate {
  subject_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  sender?: string;
  reply_to?: string;
}

export interface ICampaign {
  data: ICampaignData;
}

export function listCampaigns(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: ICampaignData[] }>({ apiEndpoint: `${apiEndpoint}`, ...streamParams });
}

export function createCampaign(campaignData: CampaignUpdate) {
  return streams.add<ICampaign>(`${apiEndpoint}`, campaignData);
}

export function updateCampaign(campaignId: string, campaignData: CampaignUpdate) {
  return streams.update<ICampaign>(`${apiEndpoint}/${campaignId}`, campaignId, campaignData);
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
