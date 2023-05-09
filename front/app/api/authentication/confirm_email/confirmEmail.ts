import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { queryClient } from 'utils/cl-react-query/queryClient';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';

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

    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

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
