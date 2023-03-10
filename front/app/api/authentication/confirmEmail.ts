import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const confirmationApiEndpoint = `${API_PATH}/user/confirm`;

export type IConfirmation = {
  code?: string | null;
};

export default async function confirmEmail(
  confirmation: Partial<IConfirmation>
) {
  const bodyData = {
    confirmation,
  };
  try {
    await streams.add(confirmationApiEndpoint, bodyData);

    await streams.fetchAllWith({
      apiEndpoint: [
        `${API_PATH}/users/me`,
        `${API_PATH}/onboarding_campaigns/current`,
      ],
    });

    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}
