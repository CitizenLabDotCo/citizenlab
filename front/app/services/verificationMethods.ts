import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IVerificationMethodNamesMap {}

type TVerificationMethodName =
  IVerificationMethodNamesMap[keyof IVerificationMethodNamesMap];

type IGenericMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: TVerificationMethodName;
  };
};

export interface IVerificationMethodMap {
  generic: IGenericMethod;
}

export type IVerificationMethod =
  IVerificationMethodMap[keyof IVerificationMethodMap];

export interface IVerificationMethods {
  data: IVerificationMethod[];
}

export function verificationMethodsStream() {
  return streams.get<IVerificationMethods>({
    apiEndpoint: `${API_PATH}/verification_methods`,
  });
}
