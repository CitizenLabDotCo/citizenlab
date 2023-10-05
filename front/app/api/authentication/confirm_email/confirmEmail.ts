import { queryClient } from 'utils/cl-react-query/queryClient';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';
import onboardingCampaignsKeys from 'api/onboarding_campaigns/keys';
import fetcher from 'utils/cl-react-query/fetcher';

const confirmationApiEndpoint = `user/confirm`;

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
    await fetcher({
      path: `/${confirmationApiEndpoint}`,
      action: 'post',
      body: bodyData,
    });
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
