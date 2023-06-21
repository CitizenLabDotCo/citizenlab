import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/texting_campaigns`;

export const deleteTextingCampaign = async (campaignId: string) => {
  const result = await streams.delete(
    `${apiEndpoint}/${campaignId}`,
    campaignId
  );

  return result;
};

export const sendTextingCampaign = async (campaignId: string) => {
  const result = await streams.add(
    `${apiEndpoint}/${campaignId}/send`,
    // no body required, just POST to /send
    {}
  );

  // campaign should be status "Sending" now, re-fetch the entity from BE
  await streams.fetchAllWith({
    apiEndpoint: [apiEndpoint, `${apiEndpoint}/${campaignId}`],
  });

  return result;
};
