import { IVerifiedResponse } from 'services/verify';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export function verifyBogus(desired_error: string) {
  return streams.add<IVerifiedResponse>(
    `${API_PATH}/verification_methods/bogus/verification`,
    {
      verification: {
        desired_error,
      },
    }
  );
}
