import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';
import onboardingCampaignsKeys from 'api/onboarding_campaigns/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { setJwt } from 'utils/auth/jwt';

const confirmationApiEndpoint = `user/confirm`;

export type IConfirmation = {
  code?: string | null;
};

type JwtResponse = {
  data: {
    type: string;
    attributes: {
      token: string;
    };
  };
};

export default async function confirmEmail(
  confirmation: Partial<IConfirmation>
) {
  const bodyData = {
    confirmation,
  };

  try {
    const data = await fetcher<JwtResponse>({
      path: `/${confirmationApiEndpoint}`,
      action: 'post',
      body: bodyData,
    });

    // TODO: JS Need to sort out rememberMe etc
    setJwt(data.data.attributes.token, false);

    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({
      queryKey: onboardingCampaignsKeys.all(),
    });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
}
