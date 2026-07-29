import { ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import smsCampaignDeliveriesKeys from './keys';

export type SmsCampaignDeliveriesKeys = Keys<typeof smsCampaignDeliveriesKeys>;

export type ISmsDeliveriesParameters = {
  campaignId: string;
  pageNumber?: number;
  pageSize?: number;
};

export type SmsDeliveryStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'undelivered'
  | 'failed'
  | 'errored';

export interface ISmsDeliveryData {
  id: string;
  type: string;
  attributes: {
    status: SmsDeliveryStatus;
    message_sid: string | null;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: IRelationship;
    };
  };
}

export interface ISmsCampaignDeliveries {
  data: ISmsDeliveryData[];
  links: ILinks;
}
