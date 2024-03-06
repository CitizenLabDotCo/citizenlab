import { ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import campaignDeliveriesKeys from './keys';

export type CampaignDeliveriesKeys = Keys<typeof campaignDeliveriesKeys>;

export type IParameters = {
  campaignId: string;
  pageNumber?: number;
  pageSize?: number;
};

export interface ICampaignDeliveries {
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
