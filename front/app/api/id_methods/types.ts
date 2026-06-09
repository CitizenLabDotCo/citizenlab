import { IconNames } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import idMethodsKeys from './keys';

export type VerificationMethodsKeys = Keys<typeof idMethodsKeys>;

export const verificationTypesLeavingPlatform = [
  'auth0',
  'id_austria',
  'criipto',
  'bosa_fas',
  'clave_unica',
  'federa',
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
  | 'federa'
  | 'franceconnect'
  | 'gent_rrn'
  | 'id_card_lookup'
  | 'keycloak'
  | 'twoday'
  | 'nemlog_in'
  | 'oostende_rrn'
  | 'id_austria'
  | 'acm'
  | 'hoplr'
  | 'vienna_citizen'
  | 'vienna_employee'
  | 'facebook'
  | 'google'
  | 'azureactivedirectory'
  | 'azureactivedirectory_b2c';

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
  type: 'id_method';
  attributes: {
    name: TVerificationMethodName;
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
  };
};

export type IDFakeSSOMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'fake_sso';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
  };
};

export type IDLookupMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'id_card_lookup';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    card_id: string;
    card_id_placeholder: string;
    card_id_tooltip: string;
    explainer_image_url: string;
    ui_method_name: string;
  };
};

export type IDCriiptoMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'criipto';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    ui_method_name: string;
  };
};

export type IDKeycloakMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'keycloak';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    ui_method_name: string;
    provider: IconNames;
  };
};

export type IDTwodayMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'twoday';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    ui_method_name: string;
  };
};

export type IDAcmMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'acm';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    ui_method_name: string;
  };
};

export type IDAuth0Method = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'auth0';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    method_name_multiloc: Multiloc;
  };
};

export type IDIdAustriaMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'id_austria';
    ui_method_name: string;
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
  };
};

// Built-in SSO login methods (login-only; cannot verify identities). Their
// configuration lives in `verification.verification_methods`, and the
// UI-relevant settings are exposed via the method's serialized attributes.
export type IDFacebookMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'facebook';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    app_id?: string;
  };
};

export type IDGoogleMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'google';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
  };
};

export type IDAzureAdMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'azureactivedirectory';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    logo_url?: string;
    login_mechanism_name?: string;
    visibility?: 'show' | 'link' | 'hide';
    enforced_email_domain_error_multiloc?: Multiloc;
  };
};

export type IDAzureAdB2cMethod = {
  id: string;
  type: 'id_method';
  attributes: {
    name: 'azureactivedirectory_b2c';
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
    logo_url?: string;
    login_mechanism_name?: string;
  };
};

export type TVerificationMethod =
  | TGenericMethod
  | IDFakeSSOMethod
  | IDLookupMethod
  | IDCriiptoMethod
  | IDKeycloakMethod
  | IDTwodayMethod
  | IDAcmMethod
  | IDAuth0Method
  | IDIdAustriaMethod
  | IDFacebookMethod
  | IDGoogleMethod
  | IDAzureAdMethod
  | IDAzureAdB2cMethod;
