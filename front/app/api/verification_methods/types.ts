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

export type TVerificationMethodName =
  | 'auth0'
  | 'bogus'
  | 'bosa_fas'
  | 'clave_unica'
  | 'cow'
  | 'criipto'
  | 'franceconnect'
  | 'gent_rrn'
  | 'id_card_lookup'
  | 'nemlog_in'
  | 'oostende_rrn';

export interface IVerificationMethods {
  data: TVerificationMethod[];
}

export interface IVerificationMethod {
  data: TVerificationMethod;
}

export type ActionMetadata = {
  allowed: boolean;
  name: string; // Readable name to be shown to end user
  locked_attributes: Multiloc[];
  other_attributes: Multiloc[];
  locked_custom_fields: Multiloc[];
  other_custom_fields: Multiloc[];
};

type TGenericMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: TVerificationMethodName;
    action_metadata?: ActionMetadata;
  };
};

type FakeSSOMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'fake_sso';
    action_metadata?: ActionMetadata;
  };
};

export type IDLookupMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'id_card_lookup';
    action_metadata?: ActionMetadata;
    card_id: string;
    card_id_placeholder: string;
    card_id_tooltip: string;
    explainer_image_url: string;
    ui_method_name: string;
  };
};

export type IDCriiptoMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'criipto';
    action_metadata?: ActionMetadata;
    ui_method_name: string;
  };
};

export type IDAuth0Method = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'auth0';
    action_metadata?: ActionMetadata;
    method_name_multiloc: Multiloc;
  };
};

export type TVerificationMethod =
  | TGenericMethod
  | FakeSSOMethod
  | IDLookupMethod
  | IDCriiptoMethod
  | IDAuth0Method;
