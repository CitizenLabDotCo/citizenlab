import { IRelationship, ILinks } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ICampaignData } from 'api/campaigns/types';
import { queryClient } from 'utils/cl-react-query/queryClient';
import campaignsKeys from 'api/campaigns/keys';

const apiEndpoint = `${API_PATH}/campaigns`;

export interface ICampaign {
  data: ICampaignData;
}

export interface IDeliveriesData {
  data: IDeliveryData[];
  links: ILinks;
}
export interface IDeliveryData {
  id: string;
  type: string;
  attributes: {
    delivery_status:
      | 'sent'
      | 'bounced'
      | 'failed'
      | 'accepted'
      | 'delivered'
      | 'opened'
      | 'clicked';
    sent_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: IRelationship;
    };
  };
}

export interface ICampaignStats {
  sent: number;
  bounced: number;
  failed: number;
  accepted: number;
  delivered: number;
  opened: number;
  clicked: number;
  all: number;
}

export async function sendCampaign(campaignId: string) {
  const stream = await streams.add<ICampaign>(
    `${apiEndpoint}/${campaignId}/send`,
    {}
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${apiEndpoint}/${campaignId}`],
  });
  await queryClient.invalidateQueries({ queryKey: campaignsKeys.all() });

  return stream;
}

export function sendCampaignPreview(campaignId: string) {
  return streams.add<ICampaign>(
    `${apiEndpoint}/${campaignId}/send_preview`,
    {}
  );
}

export function deleteCampaign(campaignId: string) {
  return streams.delete(`${apiEndpoint}/${campaignId}`, campaignId);
}

export function listCampaignDeliveries(
  campaignId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IDeliveriesData>({
    apiEndpoint: `${apiEndpoint}/${campaignId}/deliveries`,
    ...streamParams,
  });
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
