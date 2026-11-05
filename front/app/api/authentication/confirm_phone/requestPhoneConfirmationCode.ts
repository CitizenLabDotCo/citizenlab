import fetcher from 'utils/cl-react-query/fetcher';

import { setResendCooldown, tooSoonRetryAfter } from './resendCooldown';

interface RequestCodeResponse {
  data: {
    type: string;
    attributes: {
      retry_after: number;
    };
  };
}

// Both answers carry the cooldown that follows this request: how long until the
// code just sent may be replaced, or - when the request was refused - how much of
// the previous one's cooldown is left.
const requestCode = async (path: `/${string}`, body: Record<string, any>) => {
  try {
    const response = await fetcher<RequestCodeResponse>({
      path,
      action: 'post',
      body,
    });

    setResendCooldown(response.data.attributes.retry_after);
  } catch (error) {
    const retryAfter = tooSoonRetryAfter(error);
    if (retryAfter !== undefined) {
      setResendCooldown(retryAfter);
    }

    throw error;
  }
};

// Sends a code to the `phone` of an account that isn't signed in yet (phone
// signup / passwordless login).
export const requestCodePhone = async (phone: string) => {
  await requestCode('/user/request_code_phone', {
    request_code: { phone },
  });
};

// Sends a re-confirmation code to the signed-in user's own number.
// `onlyIfFirstTime` makes the send idempotent: the backend only (re)sends when
// no code is currently outstanding (the first send of the confirmation cycle).
export const requestReconfirmCodePhone = async ({
  onlyIfFirstTime = false,
}: { onlyIfFirstTime?: boolean } = {}) => {
  try {
    await requestCode('/user/request_reconfirm_code_phone', {
      request_code: { only_if_first_time: onlyIfFirstTime },
    });
  } catch (error) {
    // The idempotent auto-send has nothing to report when it is refused: a code
    // went out moments ago, which is all it was asking for.
    if (!onlyIfFirstTime || tooSoonRetryAfter(error) === undefined) {
      throw error;
    }
  }
};

export const requestCodeNewPhone = async (newPhone: string) => {
  await requestCode('/user/request_code_new_phone', {
    request_code: {
      new_phone: newPhone,
    },
  });
};
