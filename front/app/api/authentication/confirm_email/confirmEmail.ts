import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { queryClient } from 'utils/cl-react-query/queryClient';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/Authentication/tracks';

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
    trackEventByName(tracks.signUpEmailConfirmationStepSuccess);
    return true;
  } catch (errors) {
    trackEventByName(tracks.signUpEmailConfirmationStepError);
    throw errors.json.errors;
  }
}
