import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IVerifiedResponse {
  verification: {
    run: string,
    id_serial: string
  };
}

export function verifyCOW(run: string, id_serial: string) {
  return streams.add<IVerifiedResponse>(`${API_PATH}/verification_methods/cow/verification`, {
    verification: {
      run,
      id_serial
    }
  });
}
