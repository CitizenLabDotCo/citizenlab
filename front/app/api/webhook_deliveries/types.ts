import { Keys } from 'utils/cl-react-query/types';

import webhookDeliveryKeys from './keys';

export type WebhookDeliveryKeys = Keys<typeof webhookDeliveryKeys>;

export type DeliveryStatus = 'pending' | 'success' | 'failed';

export interface IWebhookDeliveryData {
  id: string;
  type: 'webhook_delivery';
  attributes: {
    webhooks_subscription_id: string;
    activity_id: string;
    event_type: string;
    status: DeliveryStatus;
    attempts: number;
    response_code: number | null;
    response_body: string | null;
    error_message: string | null;
    last_attempt_at: string | null;
    succeeded_at: string | null;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    activity?: {
      data: { id: string; type: 'activity' } | null;
    };
  };
}

export interface IWebhookDelivery {
  data: IWebhookDeliveryData;
}

export interface IWebhookDeliveries {
  data: IWebhookDeliveryData[];
  links?: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
}
