import { Multiloc } from 'typings';
// import { API_PATH } from 'containers/App/constants';
// import streams, { IStreamParams } from 'utils/streams';

// const apiEndpoint = `${API_PATH}/campaigns`;

// export interface ITextingCampaignsData {
//   data: ITextingCampaignData[];
//   links: ILinks;
// }

export interface ITextingCampaignData {
  id: string;
  attributes: {
    body_multiloc: Multiloc;
    status: string;
    sent_at: string;
    phone_numbers: number[];
  };
}

// export interface CampaignUpdate {
//   campaign_name?: string;
//   subject_multiloc?: Multiloc;
//   body_multiloc?: Multiloc;
//   sender?: string;
//   reply_to?: string;
//   group_ids?: string[];
//   enabled?: boolean;
// }

// export interface CampaignCreation {
//   campaign_name: string;
//   subject_multiloc: Multiloc;
//   body_multiloc: Multiloc;
//   sender: string;
//   reply_to?: string;
//   group_ids?: string[];
// }

// export interface ICampaign {
//   data: ITextingCampaignData;
// }

// export interface IDeliveriesData {
//   data: IDeliveryData[];
//   links: ILinks;
// }

// export interface IDeliveryData {
//   id: string;
//   attributes: {
//     body_multiloc: Multiloc;
//     status: string;
//     sent_at: string;
//     phone_numbers: number[];
//   };
// }

// export interface ICampaignStats {
//   sent: number;
//   bounced: number;
//   failed: number;
//   accepted: number;
//   delivered: number;
//   opened: number;
//   clicked: number;
//   all: number;
// }

// export function listCampaigns(streamParams: IStreamParams | null = null) {
//   return streams.get<ITextingCampaignsData>({
//     apiEndpoint: `${apiEndpoint}`,
//     ...streamParams,
//   });
// }

// export function createCampaign(campaignData: CampaignCreation) {
//   return streams.add<ICampaign>(`${apiEndpoint}`, { campaign: campaignData });
// }

// export function updateCampaign(
//   campaignId: string,
//   campaignData: CampaignUpdate
// ) {
//   return streams.update<ICampaign>(`${apiEndpoint}/${campaignId}`, campaignId, {
//     campaign: campaignData,
//   });
// }

// export async function sendCampaign(campaignId: string) {
//   const stream = await streams.add<ICampaign>(
//     `${apiEndpoint}/${campaignId}/send`,
//     {}
//   );
//   await streams.fetchAllWith({
//     apiEndpoint: [`${apiEndpoint}/${campaignId}`, `${API_PATH}/campaigns`],
//   });
//   return stream;
// }

// export function sendCampaignPreview(campaignId: string) {
//   return streams.add<ICampaign>(
//     `${apiEndpoint}/${campaignId}/send_preview`,
//     {}
//   );
// }

// export function deleteCampaign(campaignId: string) {
//   return streams.delete(`${apiEndpoint}/${campaignId}`, campaignId);
// }

// export function campaignByIdStream(
//   campaignId: string,
//   streamParams: IStreamParams | null = null
// ) {
//   return streams.get<ICampaign>({
//     apiEndpoint: `${apiEndpoint}/${campaignId}`,
//     ...streamParams,
//   });
// }

// export function listCampaignDeliveries(
//   campaignId: string,
//   streamParams: IStreamParams | null = null
// ) {
//   return streams.get<IDeliveriesData>({
//     apiEndpoint: `${apiEndpoint}/${campaignId}/deliveries`,
//     ...streamParams,
//   });
// }

// export function getCampaignStats(
//   campaignId: string,
//   streamParams: IStreamParams | null = null
// ) {
//   return streams.get<ICampaignStats>({
//     apiEndpoint: `${apiEndpoint}/${campaignId}/stats`,
//     ...streamParams,
//   });
// }

export function isDraft(campaign: ITextingCampaignData) {
  return campaign.attributes.status === 'draft';
}
