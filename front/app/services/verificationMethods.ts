import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IVerificationMethodNamesMap {}

export type TVerificationMethodName =
  IVerificationMethodNamesMap[keyof IVerificationMethodNamesMap];

type TGenericMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: TVerificationMethodName;
  };
};

export interface IVerificationMethodMap {
  generic: TGenericMethod;
}

export type TVerificationMethod =
  IVerificationMethodMap[keyof IVerificationMethodMap];

export interface IVerificationMethods {
  data: TVerificationMethod[];
}

export function verificationMethodsStream() {
  return streams.get<IVerificationMethods>({
    apiEndpoint: `${API_PATH}/verification_methods`,
  });
}

export function isLastVerificationMethod(
  verificationMethodName: TVerificationMethodName,
  verificationMethods: TVerificationMethod[]
) {
  return (
    verificationMethods
      .map((vm) => vm.attributes.name)
      .indexOf(verificationMethodName) ===
    verificationMethods.length - 1
  );
}
