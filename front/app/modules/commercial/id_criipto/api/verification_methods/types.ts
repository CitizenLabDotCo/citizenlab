import 'api/verification_methods/types';
import { Multiloc } from 'typings';

declare module 'api/verification_methods/types' {
  export interface IVerificationMethodNamesMap {
    criipto: 'criipto';
  }

  export type IDCriiptoMethod = {
    id: string;
    type: 'verification_method';
    attributes: {
      name: 'criipto';
      method_name_multiloc: Multiloc;
    };
  };

  export interface IVerificationMethodMap {
    criipto: IDCriiptoMethod;
  }
}
