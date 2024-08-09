import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import verificationMethodsKeys from './keys';

export type VerificationMethodsKeys = Keys<typeof verificationMethodsKeys>;

export const verificationTypesLeavingPlatform = [
  'auth0',
  'criipto',
  'bosa_fas',
  'clave_unica',
  'franceconnect',
  'nemlog_in',
];

export interface IVerificationMethodNamesMap {}

export type TVerificationMethodName =
  IVerificationMethodNamesMap[keyof IVerificationMethodNamesMap];

type TGenericMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: TVerificationMethodName;
    action_metadata?: {
      allowed: boolean;
      name: string; // Readable name to be shown to end user
      locked_attributes: Multiloc[];
      other_attributes: Multiloc[];
      locked_custom_fields: Multiloc[];
      other_custom_fields: Multiloc[];
    };
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
