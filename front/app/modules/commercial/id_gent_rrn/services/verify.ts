import { IVerifiedResponse } from 'services/verify';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export function verifyGentRrn(rrn: string) {
  return streams.add<IVerifiedResponse>(
    `${API_PATH}/verification_methods/gent_rrn/verification`,
    {
      verification: {
        rrn,
      },
    }
  );
}
