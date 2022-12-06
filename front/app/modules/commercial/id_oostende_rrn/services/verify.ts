import { IVerifiedResponse } from 'services/verify';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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
