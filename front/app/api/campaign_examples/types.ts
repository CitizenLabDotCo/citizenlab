import { SupportedLocale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import campaignExamplesKeys from './keys';

export type CampaignExamplesKeys = Keys<typeof campaignExamplesKeys>;

export interface ICampaignExampleParameters {
  campaignId: string;
}

export interface ICampaignExampleData {
  id: string;
  type: 'example';
  attributes: {
    mail_body_html: string;
    locale: SupportedLocale;
    subject: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    campaign: {
      data: {
        type: 'campaign';
        id: string;
      };
    };
    recipient: {
      data: {
        type: 'user';
        id: string;
      };
    };
  };
}

export interface ICampaignExampleLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface ICampaignExamples {
  data: ICampaignExampleData[];
  links: ICampaignExampleLinks;
}

export interface ICampaignExample {
  data: ICampaignExampleData;
}
