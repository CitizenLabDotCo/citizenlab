import { queryClient } from 'utils/cl-react-query/queryClient';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';
import onboardingCampaignsKeys from 'api/onboarding_campaigns/keys';
import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';

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
  const jwt = getJwt();
  try {
    await fetch(confirmationApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(bodyData),
    });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({
      queryKey: onboardingCampaignsKeys.all(),
    });

    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}
