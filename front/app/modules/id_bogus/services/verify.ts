import { API_PATH } from 'containers/App/constants';
import { IVerifiedResponse } from 'services/verify';
import streams from 'utils/streams';

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
