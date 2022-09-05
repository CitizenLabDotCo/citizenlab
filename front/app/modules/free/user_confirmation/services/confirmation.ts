import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const confirmationApiEndpoint = `${API_PATH}/user/confirm`;
export const resendCodeApiEndpoint = `${API_PATH}/user/resend_code`;

export type IConfirmation = {
  code?: string | null;
};

export async function confirm(confirmation: Partial<IConfirmation>) {
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

export async function resendCode(newEmail?: string | null) {
  const bodyData = newEmail
    ? {
        new_email: newEmail,
      }
    : null;

  try {
    await streams.add(resendCodeApiEndpoint, bodyData);

    if (bodyData?.new_email) {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });
    }

    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}
