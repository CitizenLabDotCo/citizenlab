import { SupportedLocale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import emailCampaignExamplesKeys from './keys';

export type EmailCampaignExamplesKeys = Keys<typeof emailCampaignExamplesKeys>;

export interface IEmailCampaignExampleParameters {
  campaignId: string;
}

export interface IEmailCampaignExampleData {
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

export interface IEmailCampaignExampleLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IEmailCampaignExamples {
  data: IEmailCampaignExampleData[];
  links: IEmailCampaignExampleLinks;
}

export interface IEmailCampaignExample {
  data: IEmailCampaignExampleData;
}
