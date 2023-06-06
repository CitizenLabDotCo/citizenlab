import { API_PATH } from 'containers/App/constants';
import { IVerifiedResponse } from 'api/verification_methods/types';
import streams from 'utils/streams';

export function verifyCOW(run: string, id_serial: string) {
  return streams.add<IVerifiedResponse>(
    `${API_PATH}/verification_methods/cow/verification`,
    {
      verification: {
        run,
        id_serial,
      },
    }
  );
}
