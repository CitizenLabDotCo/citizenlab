import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IVerificationMethodNamesMap {
  franceconnect: 'franceconnect';
}

export type VerificationMethodNames = IVerificationMethodNamesMap[keyof IVerificationMethodNamesMap];

export type IDLookupMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: 'id_card_lookup';
    card_id_multiloc: Multiloc;
    card_id_placeholder: string;
    card_id_tooltip_multiloc: Multiloc;
    explainer_image_url: string;
    method_name_multiloc: Multiloc;
  };
};

type IGenericMethod = {
  id: string;
  type: 'verification_method';
  attributes: {
    name: VerificationMethodNames;
  };
};

export type IVerificationMethod = IDLookupMethod | IGenericMethod;

export interface IVerificationMethods {
  data: IVerificationMethod[];
}

export function verificationMethodsStream() {
  return streams.get<IVerificationMethods>({
    apiEndpoint: `${API_PATH}/verification_methods`,
  });
}
