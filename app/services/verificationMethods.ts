import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IVerificationMethod {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'cow'
  };
}

export interface IVerificationMethods {
  data: IVerificationMethod[];
}

export function verificationMethods() {
  return streams.get<IVerificationMethods>({ apiEndpoint: `${API_PATH}/verification_methods` });
}
