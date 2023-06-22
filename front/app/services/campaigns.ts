import { IRelationship, ILinks } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/campaigns`;

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
