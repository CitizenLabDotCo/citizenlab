export interface ITextingCampaignData {
  id: string;
  attributes: {
    body: string;
    status: string;
    sent_at: string;
    phone_numbers: number[];
  };
}
