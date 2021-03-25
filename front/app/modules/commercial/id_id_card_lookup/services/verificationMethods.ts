import 'services/verificationMethods';
import { Multiloc } from 'typings';

declare module 'services/verificationMethods' {
  export interface IVerificationMethodNamesMap {
    id_card_lookup: 'id_card_lookup';
  }

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

  export interface IVerificationMethodMap {
    id_card_lookup: IDLookupMethod;
  }
}
