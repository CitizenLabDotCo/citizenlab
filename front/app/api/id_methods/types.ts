import { IconNames } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import idMethodsKeys from './keys';

export type IdMethodsKeys = Keys<typeof idMethodsKeys>;

export const omniauthVerificationTypes = [
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

export type IdMethodName =
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

// Base shape shared by every id method. Concrete methods are built from this by
// narrowing the `name` and (optionally) merging in method-specific attributes.
type TGenericMethod<
  Name extends IdMethodName = IdMethodName,
  ExtraAttributes = unknown
> = {
  id: string;
  type: 'id_method';
  attributes: {
    name: Name;
    method_metadata?: MethodMetadata;
    authentication_method: boolean;
    verification_method: boolean;
  } & ExtraAttributes;
};

export type IDFakeSSOMethod = TGenericMethod<'fake_sso'>;

export type IDLookupMethod = TGenericMethod<
  'id_card_lookup',
  {
    card_id: string;
    card_id_placeholder: string;
    card_id_tooltip: string;
    explainer_image_url: string;
    ui_method_name: string;
  }
>;

export type IDCriiptoMethod = TGenericMethod<
  'criipto',
  { ui_method_name: string }
>;

export type IDKeycloakMethod = TGenericMethod<
  'keycloak',
  { ui_method_name: string; provider: IconNames }
>;

export type IDTwodayMethod = TGenericMethod<
  'twoday',
  { ui_method_name: string }
>;

export type IDAcmMethod = TGenericMethod<'acm', { ui_method_name: string }>;

export type IDAuth0Method = TGenericMethod<
  'auth0',
  { method_name_multiloc: Multiloc }
>;

export type IDIdAustriaMethod = TGenericMethod<
  'id_austria',
  { ui_method_name: string }
>;

export type IDFacebookMethod = TGenericMethod<'facebook', { app_id?: string }>;

export type IDGoogleMethod = TGenericMethod<'google'>;

export type IDAzureAdMethod = TGenericMethod<
  'azureactivedirectory',
  {
    logo_url?: string;
    login_mechanism_name?: string;
    visibility?: 'show' | 'link' | 'hide';
    enforced_email_domain_error_multiloc?: Multiloc;
  }
>;

export type IDAzureAdB2cMethod = TGenericMethod<
  'azureactivedirectory_b2c',
  { logo_url?: string; login_mechanism_name?: string }
>;

// Methods that carry no method-specific attributes beyond the generic ones.
type TOtherMethodName = Exclude<
  IdMethodName,
  | 'fake_sso'
  | 'id_card_lookup'
  | 'criipto'
  | 'keycloak'
  | 'twoday'
  | 'acm'
  | 'auth0'
  | 'id_austria'
  | 'facebook'
  | 'google'
  | 'azureactivedirectory'
  | 'azureactivedirectory_b2c'
>;

export type IDOtherMethod = TGenericMethod<TOtherMethodName>;

export type TVerificationMethod =
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
  | IDAzureAdB2cMethod
  | IDOtherMethod;
