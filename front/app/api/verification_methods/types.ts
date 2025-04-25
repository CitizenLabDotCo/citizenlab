import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import verificationMethodsKeys from './keys';

export type VerificationMethodsKeys = Keys<typeof verificationMethodsKeys>;

export const verificationTypesLeavingPlatform = [
  'auth0',
  'id_austria',
  'criipto',
  'bosa_fas',
  'clave_unica',
  'franceconnect',
  'nemlog_in',
  'keycloak',
  'twoday',
  'fake_sso',
];

export type TVerificationMethodName =
  | 'auth0'
  | 'bogus'
  | 'fake_sso'
  | 'bosa_fas'
  | 'clave_unica'
  | 'cow'
  | 'criipto'
  | 'franceconnect'
  | 'gent_rrn'
  | 'id_card_lookup'
  | 'keycloak'
  | 'twoday'
  | 'nemlog_in'
  | 'oostende_rrn'
  | 'id_austria';

export interface IVerificationMethods {
  data: TVerificationMethod[];
}

export interface IVerificationMethod {
  data: TVerificationMethod;
}

export type MethodMetadata = {
  allowed_for_verified_actions: boolean;
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
    method_metadata?: MethodMetadata;
  };
};

export type IDFakeSSOMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'fake_sso';
    method_metadata?: MethodMetadata;
  };
};

export type IDLookupMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'id_card_lookup';
    method_metadata?: MethodMetadata;
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
    method_metadata?: MethodMetadata;
    ui_method_name: string;
  };
};

export type IDKeycloakMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'keycloak';
    method_metadata?: MethodMetadata;
    ui_method_name: string;
  };
};

export type IDTwodayMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'twoday';
    method_metadata?: MethodMetadata;
    ui_method_name: string;
  };
};

export type IDAuth0Method = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'auth0';
    method_metadata?: MethodMetadata;
    method_name_multiloc: Multiloc;
  };
};

export type IDIdAustriaMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'id_austria';
    ui_method_name: string;
    method_metadata?: MethodMetadata;
  };
};

export type TVerificationMethod =
  | TGenericMethod
  | IDFakeSSOMethod
  | IDLookupMethod
  | IDCriiptoMethod
  | IDKeycloakMethod
  | IDTwodayMethod
  | IDAuth0Method
  | IDIdAustriaMethod;
// TODO: JS - No Fake SSO?
// TODO: JS - Can we add the icon name into the method type?
