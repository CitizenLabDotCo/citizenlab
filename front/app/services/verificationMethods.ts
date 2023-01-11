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
