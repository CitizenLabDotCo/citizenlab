import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const confirmationApiEndpoint = `${API_PATH}/user/confirm`;
export const resendCodeApiEndpoint = `${API_PATH}/user/resend_code`;

export async function confirm({ code }: { code: string | null }) {
  const bodyData = {
    confirmation: { code },
  };
  try {
    await streams.add(confirmationApiEndpoint, bodyData);

    streams.fetchAllWith({
      apiEndpoint: [`${API_PATH}/users/me`],
      onlyFetchActiveStreams: true,
    });

    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}

export async function resendCode() {
  try {
    await streams.add(resendCodeApiEndpoint, {});
    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}
