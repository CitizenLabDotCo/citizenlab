import { API_PATH } from 'containers/App/constants';
import { IVerifiedResponse } from 'services/verify';
import streams from 'utils/streams';

export function verifyOostendeRrn(rrn: string) {
  return streams.add<IVerifiedResponse>(
    `${API_PATH}/verification_methods/oostende_rrn/verification`,
    {
      verification: {
        rrn,
      },
    }
  );
}
