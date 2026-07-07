import { ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import emailCampaignDeliveriesKeys from './keys';

export type EmailCampaignDeliveriesKeys = Keys<
  typeof emailCampaignDeliveriesKeys
>;

export type IEmailDeliveriesParameters = {
  campaignId: string;
  pageNumber?: number;
  pageSize?: number;
};

export interface IEmailDeliveryData {
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

export interface IEmailCampaignDeliveries {
  data: IEmailDeliveryData[];
  links: ILinks;
}
