import 'api/verification_methods/types';

declare module 'api/verification_methods/types' {
  export interface IVerificationMethodNamesMap {
    id_card_lookup: 'id_card_lookup';
  }

  export type IDLookupMethod = {
    id: string;
    type: 'verification_method';
    attributes: {
      name: 'id_card_lookup';
      card_id: string;
      card_id_placeholder: string;
      card_id_tooltip: string;
      explainer_image_url: string;
      ui_method_name: string;
    };
  };

  export interface IVerificationMethodMap {
    id_card_lookup: IDLookupMethod;
  }
}
