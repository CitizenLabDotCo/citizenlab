import { Keys } from 'utils/cl-react-query/types';

import webhookSubscriptionKeys from './keys';

export type WebhookSubscriptionKeys = Keys<typeof webhookSubscriptionKeys>;

export interface IWebhookSubscriptionData {
  id: string;
  type: 'webhook_subscription';
  attributes: {
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    created_at: string;
    updated_at: string;
    masked_secret_token: string; // Masked as "xxxx...xxxx"
    deliveries_count: number;
    recent_delivery_stats: {
      total: number;
      succeeded: number;
      failed: number;
      pending: number;
    };
  };
  relationships?: {
    project?: {
      data: { id: string; type: 'project' } | null;
    };
  };
}

export interface IWebhookSubscription {
  data: IWebhookSubscriptionData;
}

export interface IWebhookSubscriptionOnAdd {
  data: IWebhookSubscriptionData & {
    attributes: IWebhookSubscriptionData['attributes'] & {
      secret_token: string;
    };
  };
}

export interface IWebhookSubscriptions {
  data: IWebhookSubscriptionData[];
  links?: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
}

export interface IWebhookSubscriptionAdd {
  name: string;
  url: string;
  events: string[];
  enabled?: boolean;
  project_id?: string | null;
}

export interface IWebhookSubscriptionUpdate {
  name?: string;
  url?: string;
  events?: string[];
  enabled?: boolean;
  project_id?: string | null;
}

export const WEBHOOK_EVENTS = [
  'idea.created',
  'idea.published',
  'idea.changed',
  'idea.deleted',
  'user.created',
  'user.changed',
  'user.deleted',
] as const;
