import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export type VerificationMethodNames = 'cow';

export interface IVerificationMethod {
  id: string;
  type: 'verification_method';
  attributes: {
    name: VerificationMethodNames
  };
}

export interface IVerificationMethods {
  data: IVerificationMethod[];
}

export function verificationMethodsStream() {
  return streams.get<IVerificationMethods>({ apiEndpoint: `${API_PATH}/verification_methods` });
}
